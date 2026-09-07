package com.example.restaurant.service;

import com.example.restaurant.dto.order.*;
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
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderItemModifierRepository orderItemModifierRepository;
    private final OutletRepository outletRepository;
    private final RestaurantTableRepository restaurantTableRepository;
    private final MenuItemRepository menuItemRepository;
    private final ModifierRepository modifierRepository;
    private final UserRepository userRepository;
    private final KotService kotService;
    private final KotRepository kotRepository;

    private static final List<OrderStatus> TERMINAL_STATUSES = List.of(OrderStatus.COMPLETED, OrderStatus.CANCELLED);

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        OrderItemModifierRepository orderItemModifierRepository,
                        OutletRepository outletRepository,
                        RestaurantTableRepository restaurantTableRepository,
                        MenuItemRepository menuItemRepository,
                        ModifierRepository modifierRepository,
                        UserRepository userRepository,
                        KotService kotService,
                        KotRepository kotRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.orderItemModifierRepository = orderItemModifierRepository;
        this.outletRepository = outletRepository;
        this.restaurantTableRepository = restaurantTableRepository;
        this.menuItemRepository = menuItemRepository;
        this.modifierRepository = modifierRepository;
        this.userRepository = userRepository;
        this.kotService = kotService;
        this.kotRepository = kotRepository;
    }

    @Transactional
    public OrderDto createOrder(CreateOrderRequest request, String currentUsername) {
        Outlet outlet = outletRepository.findById(request.getOutletId())
                .orElseThrow(() -> new ResourceNotFoundException("Outlet", "id", request.getOutletId()));

        User createdBy = null;
        if (currentUsername != null) {
            createdBy = userRepository.findByUsername(currentUsername).orElse(null);
        }

        RestaurantTable table = null;
        if (request.getOrderType() == OrderType.DINE_IN) {
            if (request.getTableId() == null || request.getTableId().isBlank()) {
                throw new BusinessException("Table ID is required for dine-in orders");
            }
            table = restaurantTableRepository.findById(request.getTableId())
                    .orElseThrow(() -> new ResourceNotFoundException("RestaurantTable", "id", request.getTableId()));

            if (!table.getFloor().getOutlet().getId().equals(outlet.getId())) {
                throw new BusinessException("Table does not belong to the selected outlet");
            }

            // Check if table already has an active order
            List<Order> activeOrders = orderRepository.findActiveOrdersByTable(outlet.getId(), table.getId(), TERMINAL_STATUSES);
            if (!activeOrders.isEmpty()) {
                throw new BusinessException("Table " + table.getTableNumber() + " already has an active order ("
                        + activeOrders.get(0).getOrderNumber() + "). Please add items to the existing tab.");
            }

            // Automatically set table status to OCCUPIED
            table.setStatus(TableStatus.OCCUPIED);
            restaurantTableRepository.save(table);
        }

        String orderNumber = generateOrderNumber(outlet.getId());

        Order order = new Order(
                UUID.randomUUID().toString(),
                outlet,
                orderNumber,
                table,
                request.getOrderType(),
                createdBy
        );

        order.setCustomerName(request.getCustomerName());
        order.setCustomerPhone(request.getCustomerPhone());
        order.setGuestCount(request.getGuestCount() != null ? request.getGuestCount() : 1);
        order.setNotes(request.getNotes());
        order.setStatus(OrderStatus.NEW);

        // Process line items
        List<OrderItem> createdItems = processOrderItems(order, request.getItems());

        Order saved = orderRepository.save(order);

        // Auto-generate KOT for Kitchen Display System (Round 1)
        kotService.createKotForOrder(saved, createdItems, 1);

        return mapToOrderDto(saved);
    }

    @Transactional
    public OrderDto addItemsToOrder(String orderId, AddOrderItemsRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (TERMINAL_STATUSES.contains(order.getStatus())) {
            throw new BusinessException("Cannot add items to an order with status " + order.getStatus());
        }

        // Process new items and append to existing order
        List<OrderItem> createdItems = processOrderItems(order, request.getItems());

        Order saved = orderRepository.save(order);

        // Auto-generate subsequent round KOT
        int roundNumber = kotRepository.findByOrderId(order.getId()).size() + 1;
        kotService.createKotForOrder(saved, createdItems, roundNumber);

        return mapToOrderDto(saved);
    }

    @Transactional
    public OrderDto updateOrderStatus(String orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        OrderStatus currentStatus = order.getStatus();
        OrderStatus newStatus = request.getStatus();

        if (currentStatus == newStatus) {
            return mapToOrderDto(order);
        }

        if (TERMINAL_STATUSES.contains(currentStatus)) {
            throw new BusinessException("Cannot modify order in terminal status " + currentStatus);
        }

        order.setStatus(newStatus);
        if (request.getReason() != null && !request.getReason().isBlank()) {
            String currentNotes = order.getNotes() != null ? order.getNotes() + " | " : "";
            order.setNotes(currentNotes + "Status change (" + newStatus + "): " + request.getReason());
        }

        // If order was cancelled, also cancel active KOTs
        if (newStatus == OrderStatus.CANCELLED) {
            List<Kot> activeKots = kotRepository.findByOrderId(order.getId());
            for (Kot k : activeKots) {
                if (k.getStatus() != KotStatus.SERVED && k.getStatus() != KotStatus.CANCELLED) {
                    k.setStatus(KotStatus.CANCELLED);
                    kotRepository.save(k);
                }
            }
        }

        // If order was cancelled or completed and was DINE_IN, check if table should be released
        if (TERMINAL_STATUSES.contains(newStatus) && order.getTable() != null) {
            long remainingActiveOrders = orderRepository.countActiveOrdersByTable(order.getTable().getId(), TERMINAL_STATUSES);
            // If this was the only active order, mark table as AVAILABLE
            if (remainingActiveOrders <= 1) { // includes the current one being committed
                RestaurantTable table = order.getTable();
                table.setStatus(TableStatus.AVAILABLE);
                restaurantTableRepository.save(table);
            }
        }

        Order saved = orderRepository.save(order);
        return mapToOrderDto(saved);
    }

    @Transactional
    public OrderDto applyDiscount(String orderId, ApplyDiscountRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (TERMINAL_STATUSES.contains(order.getStatus())) {
            throw new BusinessException("Cannot apply discount to an order with status " + order.getStatus());
        }

        BigDecimal discountAmount = BigDecimal.ZERO;
        if ("PERCENTAGE".equalsIgnoreCase(request.getDiscountType())) {
            BigDecimal percentage = request.getDiscountValue();
            if (percentage.compareTo(BigDecimal.ZERO) < 0 || percentage.compareTo(new BigDecimal("100")) > 0) {
                throw new BusinessException("Discount percentage must be between 0 and 100");
            }
            discountAmount = order.getSubtotal()
                    .multiply(percentage)
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        } else if ("FIXED".equalsIgnoreCase(request.getDiscountType())) {
            discountAmount = request.getDiscountValue().setScale(2, RoundingMode.HALF_UP);
        } else {
            throw new BusinessException("Invalid discount type. Supported: PERCENTAGE, FIXED");
        }

        // Ensure discount cannot exceed subtotal
        if (discountAmount.compareTo(order.getSubtotal()) > 0) {
            discountAmount = order.getSubtotal();
        }

        order.setDiscountAmount(discountAmount);
        order.setTotalAmount(order.getSubtotal().add(order.getTaxAmount()).subtract(discountAmount));

        if (request.getReason() != null && !request.getReason().isBlank()) {
            String currentNotes = order.getNotes() != null ? order.getNotes() + " | " : "";
            order.setNotes(currentNotes + "Discount applied: " + request.getReason());
        }

        Order saved = orderRepository.save(order);
        return mapToOrderDto(saved);
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderById(String id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        return mapToOrderDto(order);
    }

    @Transactional(readOnly = true)
    public OrderDto getActiveOrderByTable(String outletId, String tableId) {
        List<Order> activeOrders = orderRepository.findActiveOrdersByTable(outletId, tableId, TERMINAL_STATUSES);
        if (activeOrders.isEmpty()) {
            throw new ResourceNotFoundException("Active Order", "tableId", tableId);
        }
        return mapToOrderDto(activeOrders.get(0));
    }

    @Transactional(readOnly = true)
    public PagedResponse<OrderDto> searchOrders(String outletId, OrderStatus status, OrderType orderType, String search, Pageable pageable) {
        String querySearch = (search != null && !search.isBlank()) ? search.trim() : null;
        Page<Order> orderPage = orderRepository.searchOrders(outletId, status, orderType, querySearch, pageable);
        return PagedResponse.from(orderPage.map(this::mapToOrderDto));
    }

    @Transactional(readOnly = true)
    public OrderStatsDto getOrderStats(String outletId) {
        long total = orderRepository.countTodayOrders(outletId, LocalDate.now().atStartOfDay());
        long active = orderRepository.countByOutletIdAndStatusNotIn(outletId, TERMINAL_STATUSES);
        long completed = orderRepository.countByOutletIdAndStatus(outletId, OrderStatus.COMPLETED);
        long cancelled = orderRepository.countByOutletIdAndStatus(outletId, OrderStatus.CANCELLED);
        return new OrderStatsDto(total, active, completed, cancelled);
    }

    private List<OrderItem> processOrderItems(Order order, List<CreateOrderItemRequest> itemRequests) {
        BigDecimal totalSubtotal = order.getSubtotal() != null ? order.getSubtotal() : BigDecimal.ZERO;
        BigDecimal totalTax = order.getTaxAmount() != null ? order.getTaxAmount() : BigDecimal.ZERO;
        List<OrderItem> createdItems = new ArrayList<>();

        for (CreateOrderItemRequest itemReq : itemRequests) {
            MenuItem menuItem = menuItemRepository.findById(itemReq.getMenuItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", itemReq.getMenuItemId()));

            if (!menuItem.isActive()) {
                throw new BusinessException("Menu item '" + menuItem.getName() + "' is inactive");
            }

            // 86-list check
            if (!menuItem.isAvailable()) {
                throw new BusinessException("Menu item '" + menuItem.getName() + "' is currently sold out / marked 86");
            }

            int qty = itemReq.getQuantity() != null && itemReq.getQuantity() > 0 ? itemReq.getQuantity() : 1;
            BigDecimal basePrice = menuItem.getPrice();
            BigDecimal modifiersDelta = BigDecimal.ZERO;

            List<Modifier> selectedModifiers = new ArrayList<>();
            if (itemReq.getSelectedModifierIds() != null && !itemReq.getSelectedModifierIds().isEmpty()) {
                for (String modId : itemReq.getSelectedModifierIds()) {
                    Modifier mod = modifierRepository.findById(modId)
                            .orElseThrow(() -> new ResourceNotFoundException("Modifier", "id", modId));

                    if (!mod.isActive()) {
                        throw new BusinessException("Modifier '" + mod.getName() + "' is inactive");
                    }
                    selectedModifiers.add(mod);
                    modifiersDelta = modifiersDelta.add(mod.getPrice());
                }
            }

            BigDecimal unitPrice = basePrice.add(modifiersDelta);
            BigDecimal lineSubtotal = unitPrice.multiply(BigDecimal.valueOf(qty)).setScale(2, RoundingMode.HALF_UP);

            BigDecimal taxRate = menuItem.getTaxRate() != null ? menuItem.getTaxRate() : new BigDecimal("5.00");
            BigDecimal lineTax = lineSubtotal.multiply(taxRate)
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

            OrderItem orderItem = new OrderItem(
                    UUID.randomUUID().toString(),
                    order,
                    menuItem,
                    menuItem.getName(),
                    unitPrice,
                    qty,
                    lineSubtotal,
                    itemReq.getNotes()
            );

            // Add modifiers to order item
            for (Modifier mod : selectedModifiers) {
                OrderItemModifier itemMod = new OrderItemModifier(
                        UUID.randomUUID().toString(),
                        orderItem,
                        mod,
                        mod.getName(),
                        mod.getPrice()
                );
                orderItem.addModifier(itemMod);
            }

            order.addItem(orderItem);
            createdItems.add(orderItem);
            totalSubtotal = totalSubtotal.add(lineSubtotal);
            totalTax = totalTax.add(lineTax);
        }

        order.setSubtotal(totalSubtotal);
        order.setTaxAmount(totalTax);
        BigDecimal discount = order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO;
        order.setTotalAmount(totalSubtotal.add(totalTax).subtract(discount));
        return createdItems;
    }

    private String generateOrderNumber(String outletId) {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long todayCount = orderRepository.countTodayOrders(outletId, LocalDate.now().atStartOfDay());
        return String.format("ORD-%s-%04d", datePart, todayCount + 1);
    }

    public OrderDto mapToOrderDto(Order order) {
        List<OrderItemDto> itemDtos = order.getItems().stream().map(item -> {
            List<OrderItemModifierDto> modDtos = item.getModifiers().stream().map(mod ->
                    new OrderItemModifierDto(
                            mod.getId(),
                            mod.getModifier() != null ? mod.getModifier().getId() : null,
                            mod.getModifierName(),
                            mod.getPrice()
                    )
            ).collect(Collectors.toList());

            return new OrderItemDto(
                    item.getId(),
                    item.getMenuItem() != null ? item.getMenuItem().getId() : null,
                    item.getItemName(),
                    item.getUnitPrice(),
                    item.getQuantity(),
                    item.getSubtotal(),
                    item.getStatus(),
                    item.getNotes(),
                    modDtos,
                    item.getCreatedAt()
            );
        }).collect(Collectors.toList());

        String tableId = null;
        String tableNumber = null;
        String floorName = null;
        if (order.getTable() != null) {
            tableId = order.getTable().getId();
            tableNumber = order.getTable().getTableNumber();
            if (order.getTable().getFloor() != null) {
                floorName = order.getTable().getFloor().getName();
            }
        }

        String createdById = order.getCreatedBy() != null ? order.getCreatedBy().getId() : null;
        String createdByName = order.getCreatedBy() != null ? order.getCreatedBy().getFullName() : null;

        return new OrderDto(
                order.getId(),
                order.getOutlet().getId(),
                order.getOutlet().getName(),
                order.getOrderNumber(),
                tableId,
                tableNumber,
                floorName,
                order.getCustomerName(),
                order.getCustomerPhone(),
                order.getGuestCount(),
                order.getOrderType(),
                order.getStatus(),
                order.getSubtotal(),
                order.getTaxAmount(),
                order.getDiscountAmount(),
                order.getTotalAmount(),
                order.getNotes(),
                createdById,
                createdByName,
                itemDtos,
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }
}
