package com.example.restaurant.service;

import com.example.restaurant.dto.response.PagedResponse;
import com.example.restaurant.dto.inventory.*;
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
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderItemRepository purchaseOrderItemRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final OutletRepository outletRepository;
    private final UserRepository userRepository;

    public PurchaseOrderService(PurchaseOrderRepository purchaseOrderRepository,
                                PurchaseOrderItemRepository purchaseOrderItemRepository,
                                InventoryItemRepository inventoryItemRepository,
                                InventoryTransactionRepository inventoryTransactionRepository,
                                OutletRepository outletRepository,
                                UserRepository userRepository) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.purchaseOrderItemRepository = purchaseOrderItemRepository;
        this.inventoryItemRepository = inventoryItemRepository;
        this.inventoryTransactionRepository = inventoryTransactionRepository;
        this.outletRepository = outletRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public PurchaseOrderDto createPurchaseOrder(CreatePurchaseOrderRequest request, String currentUsername) {
        Outlet outlet = outletRepository.findById(request.getOutletId())
                .orElseThrow(() -> new ResourceNotFoundException("Outlet", "id", request.getOutletId()));

        User createdBy = null;
        if (currentUsername != null) {
            createdBy = userRepository.findByUsername(currentUsername).orElse(null);
        }

        String poNumber = generatePoNumber(outlet.getId());

        PurchaseOrder po = new PurchaseOrder(
                UUID.randomUUID().toString(),
                outlet,
                poNumber,
                request.getSupplierName(),
                request.getSupplierContact(),
                createdBy,
                request.getNotes()
        );

        BigDecimal grandTotal = BigDecimal.ZERO;

        for (CreatePurchaseOrderItemRequest itemReq : request.getItems()) {
            InventoryItem inventoryItem = inventoryItemRepository.findById(itemReq.getInventoryItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("InventoryItem", "id", itemReq.getInventoryItemId()));

            BigDecimal subtotal = itemReq.getUnitCost().multiply(itemReq.getQuantity()).setScale(2, RoundingMode.HALF_UP);
            grandTotal = grandTotal.add(subtotal);

            PurchaseOrderItem poItem = new PurchaseOrderItem(
                    UUID.randomUUID().toString(),
                    po,
                    inventoryItem,
                    itemReq.getQuantity(),
                    itemReq.getUnitCost(),
                    subtotal
            );
            po.addItem(poItem);
        }

        po.setTotalAmount(grandTotal);
        PurchaseOrder savedPo = purchaseOrderRepository.save(po);

        return mapToDto(savedPo);
    }

    @Transactional
    public PurchaseOrderDto receivePurchaseOrder(String poId, String currentUsername) {
        PurchaseOrder po = purchaseOrderRepository.findById(poId)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", poId));

        if (po.getStatus() == PurchaseOrderStatus.RECEIVED) {
            throw new BusinessException("Purchase order " + po.getPoNumber() + " has already been received");
        }
        if (po.getStatus() == PurchaseOrderStatus.CANCELLED) {
            throw new BusinessException("Cannot receive a cancelled purchase order");
        }

        User user = null;
        if (currentUsername != null) {
            user = userRepository.findByUsername(currentUsername).orElse(null);
        }

        po.setStatus(PurchaseOrderStatus.RECEIVED);
        po.setReceivedAt(LocalDateTime.now());

        // Update inventory stock and weighted average cost for each item
        for (PurchaseOrderItem poItem : po.getItems()) {
            InventoryItem item = poItem.getInventoryItem();
            BigDecimal prevStock = item.getCurrentStock();
            BigDecimal newStock = prevStock.add(poItem.getQuantity());

            // Weighted average cost formula: (prevStock * prevCost + addedStock * addedCost) / newStock
            if (newStock.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal prevValuation = prevStock.compareTo(BigDecimal.ZERO) > 0
                        ? prevStock.multiply(item.getUnitCost())
                        : BigDecimal.ZERO;
                BigDecimal addedValuation = poItem.getQuantity().multiply(poItem.getUnitCost());
                BigDecimal newUnitCost = prevValuation.add(addedValuation).divide(newStock, 2, RoundingMode.HALF_UP);
                item.setUnitCost(newUnitCost);
            }

            item.setCurrentStock(newStock);
            updateStockStatus(item);
            inventoryItemRepository.save(item);

            // Record transaction
            InventoryTransaction tx = new InventoryTransaction(
                    UUID.randomUUID().toString(),
                    item,
                    InventoryTransactionType.PURCHASE,
                    poItem.getQuantity(),
                    newStock,
                    po.getId(),
                    "PO " + po.getPoNumber() + " received from " + po.getSupplierName(),
                    user
            );
            inventoryTransactionRepository.save(tx);
        }

        PurchaseOrder savedPo = purchaseOrderRepository.save(po);
        return mapToDto(savedPo);
    }

    @Transactional(readOnly = true)
    public PagedResponse<PurchaseOrderDto> searchPOs(String outletId, PurchaseOrderStatus status, String search, Pageable pageable) {
        String querySearch = (search != null && !search.isBlank()) ? search.trim() : null;

        Page<PurchaseOrder> page = purchaseOrderRepository.searchPOs(outletId, status, querySearch, pageable);
        List<PurchaseOrderDto> content = page.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    @Transactional(readOnly = true)
    public PurchaseOrderDto getPOById(String id) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", id));
        return mapToDto(po);
    }

    private String generatePoNumber(String outletId) {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = purchaseOrderRepository.countTodayPOs(outletId, LocalDate.now().atStartOfDay()) + 1;
        return String.format("PO-%s-%04d", dateStr, count);
    }

    private void updateStockStatus(InventoryItem item) {
        if (item.getCurrentStock().compareTo(BigDecimal.ZERO) <= 0) {
            item.setStatus("OUT_OF_STOCK");
        } else if (item.getCurrentStock().compareTo(item.getMinimumStock()) <= 0) {
            item.setStatus("LOW_STOCK");
        } else {
            item.setStatus("NORMAL");
        }
    }

    public PurchaseOrderDto mapToDto(PurchaseOrder po) {
        List<PurchaseOrderItemDto> items = po.getItems().stream()
                .map(item -> new PurchaseOrderItemDto(
                        item.getId(),
                        item.getInventoryItem().getId(),
                        item.getInventoryItem().getName(),
                        item.getInventoryItem().getSku(),
                        item.getInventoryItem().getUnit().getSymbol(),
                        item.getQuantity(),
                        item.getUnitCost(),
                        item.getSubtotal()
                ))
                .collect(Collectors.toList());

        String createdByName = po.getCreatedBy() != null
                ? po.getCreatedBy().getFullName()
                : "System";

        return new PurchaseOrderDto(
                po.getId(),
                po.getOutlet().getId(),
                po.getOutlet().getName(),
                po.getPoNumber(),
                po.getSupplierName(),
                po.getSupplierContact(),
                po.getStatus(),
                po.getTotalAmount(),
                po.getNotes(),
                createdByName,
                po.getReceivedAt(),
                po.getCreatedAt(),
                items
        );
    }
}
