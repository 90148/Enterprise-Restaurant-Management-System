package com.example.restaurant.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_transactions")
public class InventoryTransaction {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_item_id", nullable = false)
    private InventoryItem inventoryItem;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 20)
    private InventoryTransactionType transactionType;

    @Column(name = "quantity_changed", nullable = false, precision = 10, scale = 3)
    private BigDecimal quantityChanged;

    @Column(name = "remaining_stock", nullable = false, precision = 12, scale = 3)
    private BigDecimal remainingStock;

    @Column(name = "reference_id", length = 36)
    private String referenceId;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public InventoryTransaction() {
    }

    public InventoryTransaction(String id, InventoryItem inventoryItem,
                                InventoryTransactionType transactionType,
                                BigDecimal quantityChanged, BigDecimal remainingStock,
                                String referenceId, String notes, User createdBy) {
        this.id = id;
        this.inventoryItem = inventoryItem;
        this.transactionType = transactionType;
        this.quantityChanged = quantityChanged;
        this.remainingStock = remainingStock;
        this.referenceId = referenceId;
        this.notes = notes;
        this.createdBy = createdBy;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public InventoryItem getInventoryItem() {
        return inventoryItem;
    }

    public void setInventoryItem(InventoryItem inventoryItem) {
        this.inventoryItem = inventoryItem;
    }

    public InventoryTransactionType getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(InventoryTransactionType transactionType) {
        this.transactionType = transactionType;
    }

    public BigDecimal getQuantityChanged() {
        return quantityChanged;
    }

    public void setQuantityChanged(BigDecimal quantityChanged) {
        this.quantityChanged = quantityChanged;
    }

    public BigDecimal getRemainingStock() {
        return remainingStock;
    }

    public void setRemainingStock(BigDecimal remainingStock) {
        this.remainingStock = remainingStock;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
