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
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    private final InventoryItemRepository inventoryItemRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final RecipeRepository recipeRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final RefundRepository refundRepository;
    private final UserRepository userRepository;

    public InventoryService(InventoryItemRepository inventoryItemRepository,
                            InventoryTransactionRepository inventoryTransactionRepository,
                            RecipeRepository recipeRepository,
                            PurchaseOrderRepository purchaseOrderRepository,
                            RefundRepository refundRepository,
                            UserRepository userRepository) {
        this.inventoryItemRepository = inventoryItemRepository;
        this.inventoryTransactionRepository = inventoryTransactionRepository;
        this.recipeRepository = recipeRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.refundRepository = refundRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public PagedResponse<InventoryItemDetailDto> searchInventoryItems(String outletId, String status, String search, Pageable pageable) {
        String queryStatus = (status != null && !status.isBlank()) ? status.trim().toUpperCase() : null;
        String querySearch = (search != null && !search.isBlank()) ? search.trim() : null;

        Page<InventoryItem> page = inventoryItemRepository.searchItems(outletId, queryStatus, querySearch, pageable);
        List<InventoryItemDetailDto> content = page.getContent().stream()
                .map(this::mapToItemDetailDto)
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
    public List<InventoryItemDetailDto> getLowStockItems(String outletId) {
        return inventoryItemRepository.findLowStockItems(outletId).stream()
                .map(this::mapToItemDetailDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InventoryItemDetailDto getInventoryItemById(String id) {
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryItem", "id", id));
        return mapToItemDetailDto(item);
    }

    @Transactional
    public InventoryItemDetailDto adjustStock(String id, AdjustStockRequest request, String currentUsername) {
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryItem", "id", id));

        BigDecimal previousStock = item.getCurrentStock();
        BigDecimal newStock = previousStock.add(request.getQuantity());

        if (newStock.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("Stock cannot be adjusted below zero. Current stock is " + previousStock);
        }

        item.setCurrentStock(newStock);
        updateStockStatus(item);
        InventoryItem savedItem = inventoryItemRepository.save(item);

        User user = null;
        if (currentUsername != null) {
            user = userRepository.findByUsername(currentUsername).orElse(null);
        }

        InventoryTransactionType type = request.getType() != null ? request.getType() : InventoryTransactionType.ADJUSTMENT;
        InventoryTransaction tx = new InventoryTransaction(
                UUID.randomUUID().toString(),
                savedItem,
                type,
                request.getQuantity(),
                newStock,
                null,
                request.getNotes() != null ? request.getNotes() : "Manual stock adjustment",
                user
        );
        inventoryTransactionRepository.save(tx);

        return mapToItemDetailDto(savedItem);
    }

    @Transactional
    public void deductStockForOrder(Order order) {
        if (order == null || order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
            return;
        }

        // Idempotency check: don't deduct multiple times for the same order
        if (inventoryTransactionRepository.existsByReferenceIdAndTransactionType(order.getId(), InventoryTransactionType.SALE)) {
            return;
        }

        for (OrderItem orderItem : order.getOrderItems()) {
            if (orderItem.getMenuItem() == null) {
                continue;
            }

            recipeRepository.findByMenuItemId(orderItem.getMenuItem().getId()).ifPresent(recipe -> {
                if (recipe.getRecipeItems() != null) {
                    for (RecipeItem recipeItem : recipe.getRecipeItems()) {
                        InventoryItem rawItem = recipeItem.getInventoryItem();
                        if (rawItem != null) {
                            BigDecimal qtyToDeduct = recipeItem.getQuantity()
                                    .multiply(BigDecimal.valueOf(orderItem.getQuantity()));

                            BigDecimal previousStock = rawItem.getCurrentStock();
                            BigDecimal newStock = previousStock.subtract(qtyToDeduct);
                            if (newStock.compareTo(BigDecimal.ZERO) < 0) {
                                newStock = BigDecimal.ZERO;
                            }

                            rawItem.setCurrentStock(newStock);
                            updateStockStatus(rawItem);
                            inventoryItemRepository.save(rawItem);

                            InventoryTransaction tx = new InventoryTransaction(
                                    UUID.randomUUID().toString(),
                                    rawItem,
                                    InventoryTransactionType.SALE,
                                    qtyToDeduct.negate(),
                                    newStock,
                                    order.getId(),
                                    "Recipe deduction: " + orderItem.getMenuItem().getName() + " (Qty " + orderItem.getQuantity() + ")",
                                    order.getCreatedBy()
                            );
                            inventoryTransactionRepository.save(tx);
                        }
                    }
                }
            });
        }
    }

    @Transactional(readOnly = true)
    public List<InventoryTransactionDto> getItemTransactions(String itemId) {
        return inventoryTransactionRepository.findByInventoryItemIdOrderByCreatedAtDesc(itemId).stream()
                .map(this::mapToTransactionDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PagedResponse<InventoryTransactionDto> getOutletTransactions(String outletId, Pageable pageable) {
        Page<InventoryTransaction> page = inventoryTransactionRepository
                .findByInventoryItemOutletIdOrderByCreatedAtDesc(outletId, pageable);

        List<InventoryTransactionDto> content = page.getContent().stream()
                .map(this::mapToTransactionDto)
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
    public InventoryStatsDto getInventoryStats(String outletId) {
        long totalItems = inventoryItemRepository.countByOutletId(outletId);
        long lowStockCount = inventoryItemRepository.countByOutletIdAndStatus(outletId, "LOW_STOCK");
        long outOfStockCount = inventoryItemRepository.countByOutletIdAndStatus(outletId, "OUT_OF_STOCK");
        BigDecimal totalValuation = inventoryItemRepository.calculateTotalValuation(outletId);

        long todayPurchasesCount = purchaseOrderRepository.countTodayPOs(outletId, LocalDate.now().atStartOfDay());
        BigDecimal todayRefundsTotal = refundRepository.sumTodayRefunds(outletId, LocalDate.now().atStartOfDay());

        return new InventoryStatsDto(
                totalItems,
                lowStockCount,
                outOfStockCount,
                totalValuation,
                todayPurchasesCount,
                todayRefundsTotal
        );
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

    public InventoryItemDetailDto mapToItemDetailDto(InventoryItem item) {
        return new InventoryItemDetailDto(
                item.getId(),
                item.getOutlet().getId(),
                item.getName(),
                item.getSku(),
                item.getUnit().getId(),
                item.getUnit().getName(),
                item.getUnit().getSymbol(),
                item.getCurrentStock(),
                item.getMinimumStock(),
                item.getUnitCost(),
                item.getStatus(),
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }

    public InventoryTransactionDto mapToTransactionDto(InventoryTransaction tx) {
        return new InventoryTransactionDto(
                tx.getId(),
                tx.getInventoryItem().getId(),
                tx.getInventoryItem().getName(),
                tx.getInventoryItem().getUnit().getSymbol(),
                tx.getTransactionType(),
                tx.getQuantityChanged(),
                tx.getRemainingStock(),
                tx.getReferenceId(),
                tx.getNotes(),
                tx.getCreatedBy() != null ? tx.getCreatedBy().getId() : null,
                tx.getCreatedBy() != null ? tx.getCreatedBy().getFullName() : "System",
                tx.getCreatedAt()
        );
    }
}
