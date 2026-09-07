package com.example.restaurant.service;

import com.example.restaurant.dto.billing.*;
import com.example.restaurant.dto.response.PagedResponse;
import com.example.restaurant.entity.*;
import com.example.restaurant.exception.BusinessException;
import com.example.restaurant.exception.ResourceNotFoundException;
import com.example.restaurant.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BillingService {

    private final BillRepository billRepository;
    private final BillItemRepository billItemRepository;
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final RestaurantTableRepository restaurantTableRepository;
    private final UserRepository userRepository;

    private final InventoryService inventoryService;

    private static final List<OrderStatus> TERMINAL_ORDER_STATUSES = List.of(OrderStatus.COMPLETED, OrderStatus.CANCELLED);

    public BillingService(BillRepository billRepository,
                          BillItemRepository billItemRepository,
                          PaymentRepository paymentRepository,
                          OrderRepository orderRepository,
                          RestaurantTableRepository restaurantTableRepository,
                          UserRepository userRepository,
                          InventoryService inventoryService) {
        this.billRepository = billRepository;
        this.billItemRepository = billItemRepository;
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.restaurantTableRepository = restaurantTableRepository;
        this.userRepository = userRepository;
        this.inventoryService = inventoryService;
    }

    @Transactional
    public BillDto generateBillForOrder(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BusinessException("Cannot generate bill for a cancelled order");
        }

        // Check if an existing bill is present for this order
        Optional<Bill> existingOpt = billRepository.findByOrderId(orderId);
        if (existingOpt.isPresent()) {
            Bill existing = existingOpt.get();
            if (existing.getStatus() == BillStatus.PAID) {
                return mapToBillDto(existing);
            }
            if (existing.getStatus() != BillStatus.CANCELLED) {
                // Synchronize latest order totals & line items if unpaid
                syncBillWithOrder(existing, order);
                Bill saved = billRepository.save(existing);
                return mapToBillDto(saved);
            }
        }

        // Generate new Bill
        String billNumber = generateBillNumber(order.getOutlet().getId());
        Bill bill = new Bill(
                UUID.randomUUID().toString(),
                order.getOutlet(),
                order,
                billNumber,
                order.getSubtotal(),
                order.getTaxAmount(),
                order.getDiscountAmount(),
                order.getTotalAmount(),
                order.getNotes()
        );

        // Snapshot line items
        for (OrderItem item : order.getItems()) {
            String modSummary = "";
            if (item.getModifiers() != null && !item.getModifiers().isEmpty()) {
                modSummary = item.getModifiers().stream()
                        .map(OrderItemModifier::getModifierName)
                        .collect(Collectors.joining(", "));
            }

            BillItem billItem = new BillItem(
                    UUID.randomUUID().toString(),
                    bill,
                    item,
                    item.getMenuItem(),
                    item.getItemName(),
                    item.getUnitPrice(),
                    item.getQuantity(),
                    item.getSubtotal(),
                    modSummary,
                    item.getNotes()
            );
            bill.addItem(billItem);
        }

        // Transition dining table to BILLING status if Dine-In
        if (order.getOrderType() == OrderType.DINE_IN && order.getTable() != null) {
            RestaurantTable table = order.getTable();
            if (table.getStatus() == TableStatus.OCCUPIED) {
                table.setStatus(TableStatus.BILLING);
                restaurantTableRepository.save(table);
            }
        }

        Bill saved = billRepository.save(bill);
        return mapToBillDto(saved);
    }

    @Transactional
    public BillDto processPayment(String billId, ProcessPaymentRequest request, String currentUsername) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill", "id", billId));

        if (bill.getStatus() == BillStatus.PAID) {
            throw new BusinessException("Bill " + bill.getBillNumber() + " is already fully settled");
        }
        if (bill.getStatus() == BillStatus.CANCELLED) {
            throw new BusinessException("Cannot process payment for a cancelled bill");
        }

        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Payment amount must be greater than zero");
        }

        BigDecimal appliedAmount = request.getAmount();
        BigDecimal tendered = request.getTenderedAmount() != null ? request.getTenderedAmount() : appliedAmount;
        BigDecimal change = BigDecimal.ZERO;

        if (tendered.compareTo(appliedAmount) > 0) {
            change = tendered.subtract(appliedAmount);
        }

        // If applied amount exceeds remaining balance, cap applied to balance and add excess to change
        if (appliedAmount.compareTo(bill.getBalanceAmount()) > 0) {
            BigDecimal excess = appliedAmount.subtract(bill.getBalanceAmount());
            appliedAmount = bill.getBalanceAmount();
            change = change.add(excess);
        }

        User createdBy = null;
        if (currentUsername != null) {
            createdBy = userRepository.findByUsername(currentUsername).orElse(null);
        }

        Payment payment = new Payment(
                UUID.randomUUID().toString(),
                bill,
                bill.getOutlet(),
                request.getPaymentMethod(),
                appliedAmount,
                tendered,
                change,
                request.getTransactionRef(),
                createdBy,
                request.getNotes()
        );

        bill.addPayment(payment);

        // Update financial balances
        BigDecimal newPaidAmount = bill.getPaidAmount().add(appliedAmount);
        BigDecimal newBalanceAmount = bill.getTotalAmount().subtract(newPaidAmount);
        if (newBalanceAmount.compareTo(BigDecimal.ZERO) < 0) {
            newBalanceAmount = BigDecimal.ZERO;
        }

        bill.setPaidAmount(newPaidAmount);
        bill.setBalanceAmount(newBalanceAmount);

        // Full settlement check
        if (newBalanceAmount.compareTo(BigDecimal.ZERO) <= 0) {
            bill.setStatus(BillStatus.PAID);

            // Complete the parent order
            Order parentOrder = bill.getOrder();
            if (parentOrder != null && parentOrder.getStatus() != OrderStatus.COMPLETED) {
                parentOrder.setStatus(OrderStatus.COMPLETED);
                orderRepository.save(parentOrder);

                // Deduct recipe ingredient stock for the completed order
                inventoryService.deductStockForOrder(parentOrder);

                // Release table if Dine-In
                if (parentOrder.getTable() != null) {
                    long activeOrders = orderRepository.countActiveOrdersByTable(
                            parentOrder.getTable().getId(),
                            TERMINAL_ORDER_STATUSES
                    );
                    if (activeOrders <= 0) {
                        RestaurantTable table = parentOrder.getTable();
                        table.setStatus(TableStatus.AVAILABLE);
                        restaurantTableRepository.save(table);
                    }
                }
            }
        } else {
            bill.setStatus(BillStatus.PARTIALLY_PAID);
        }

        Bill saved = billRepository.save(bill);
        return mapToBillDto(saved);
    }

    @Transactional(readOnly = true)
    public BillDto getBillById(String id) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill", "id", id));
        return mapToBillDto(bill);
    }

    @Transactional(readOnly = true)
    public BillDto getBillByOrderId(String orderId) {
        Bill bill = billRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill", "orderId", orderId));
        return mapToBillDto(bill);
    }

    @Transactional(readOnly = true)
    public PagedResponse<BillDto> searchBills(String outletId, BillStatus status, String search, Pageable pageable) {
        String querySearch = (search != null && !search.isBlank()) ? search.trim() : null;
        Page<Bill> page = billRepository.searchBills(outletId, status, querySearch, pageable);
        return PagedResponse.from(page.map(this::mapToBillDto));
    }

    @Transactional(readOnly = true)
    public BillingStatsDto getBillingStats(String outletId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        long totalToday = billRepository.countTodayBills(outletId, startOfDay);
        long unpaid = billRepository.countByOutletIdAndStatus(outletId, BillStatus.UNPAID)
                + billRepository.countByOutletIdAndStatus(outletId, BillStatus.PARTIALLY_PAID);
        long paid = billRepository.countByOutletIdAndStatus(outletId, BillStatus.PAID);
        BigDecimal revenue = billRepository.sumTodayRevenue(outletId, startOfDay);

        return new BillingStatsDto(totalToday, unpaid, paid, revenue);
    }

    private void syncBillWithOrder(Bill bill, Order order) {
        bill.setSubtotal(order.getSubtotal());
        bill.setTaxAmount(order.getTaxAmount());
        bill.setDiscountAmount(order.getDiscountAmount());
        bill.setTotalAmount(order.getTotalAmount());
        BigDecimal balance = order.getTotalAmount().subtract(bill.getPaidAmount());
        bill.setBalanceAmount(balance.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : balance);

        // Replace bill items with current order items
        bill.getItems().clear();
        for (OrderItem item : order.getItems()) {
            String modSummary = "";
            if (item.getModifiers() != null && !item.getModifiers().isEmpty()) {
                modSummary = item.getModifiers().stream()
                        .map(OrderItemModifier::getModifierName)
                        .collect(Collectors.joining(", "));
            }

            BillItem billItem = new BillItem(
                    UUID.randomUUID().toString(),
                    bill,
                    item,
                    item.getMenuItem(),
                    item.getItemName(),
                    item.getUnitPrice(),
                    item.getQuantity(),
                    item.getSubtotal(),
                    modSummary,
                    item.getNotes()
            );
            bill.addItem(billItem);
        }
    }

    private String generateBillNumber(String outletId) {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long todayCount = billRepository.countTodayBills(outletId, LocalDate.now().atStartOfDay());
        return String.format("BILL-%s-%04d", datePart, todayCount + 1);
    }

    public BillDto mapToBillDto(Bill bill) {
        List<BillItemDto> itemDtos = bill.getItems().stream().map(item ->
                new BillItemDto(
                        item.getId(),
                        item.getOrderItem() != null ? item.getOrderItem().getId() : null,
                        item.getMenuItem() != null ? item.getMenuItem().getId() : null,
                        item.getItemName(),
                        item.getUnitPrice(),
                        item.getQuantity(),
                        item.getSubtotal(),
                        item.getModifiersSummary(),
                        item.getNotes(),
                        item.getCreatedAt()
                )
        ).collect(Collectors.toList());

        List<PaymentDto> paymentDtos = bill.getPayments().stream().map(payment -> {
            String createdById = payment.getCreatedBy() != null ? payment.getCreatedBy().getId() : null;
            String createdByName = payment.getCreatedBy() != null ? payment.getCreatedBy().getFullName() : null;

            return new PaymentDto(
                    payment.getId(),
                    payment.getBill().getId(),
                    payment.getOutlet().getId(),
                    payment.getPaymentMethod(),
                    payment.getAmount(),
                    payment.getTenderedAmount(),
                    payment.getChangeAmount(),
                    payment.getTransactionRef(),
                    payment.getStatus(),
                    payment.getNotes(),
                    createdById,
                    createdByName,
                    payment.getCreatedAt()
            );
        }).collect(Collectors.toList());

        Order order = bill.getOrder();
        String tableId = null;
        String tableNumber = null;
        String floorName = null;
        OrderType orderType = OrderType.DINE_IN;
        String customerName = null;
        String customerPhone = null;

        if (order != null) {
            orderType = order.getOrderType();
            customerName = order.getCustomerName();
            customerPhone = order.getCustomerPhone();
            if (order.getTable() != null) {
                tableId = order.getTable().getId();
                tableNumber = order.getTable().getTableNumber();
                if (order.getTable().getFloor() != null) {
                    floorName = order.getTable().getFloor().getName();
                }
            }
        }

        return new BillDto(
                bill.getId(),
                bill.getOutlet().getId(),
                bill.getOutlet().getName(),
                bill.getOrder().getId(),
                bill.getOrder().getOrderNumber(),
                bill.getBillNumber(),
                tableId,
                tableNumber,
                floorName,
                orderType,
                customerName,
                customerPhone,
                bill.getSubtotal(),
                bill.getTaxAmount(),
                bill.getDiscountAmount(),
                bill.getTotalAmount(),
                bill.getPaidAmount(),
                bill.getBalanceAmount(),
                bill.getStatus(),
                bill.getNotes(),
                itemDtos,
                paymentDtos,
                bill.getCreatedAt(),
                bill.getUpdatedAt()
        );
    }
}
