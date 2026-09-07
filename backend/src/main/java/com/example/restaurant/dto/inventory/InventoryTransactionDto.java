package com.example.restaurant.dto.inventory;

import com.example.restaurant.entity.InventoryTransactionType;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class InventoryTransactionDto {

    private String id;
    private String inventoryItemId;
    private String inventoryItemName;
    private String unitSymbol;
    private InventoryTransactionType transactionType;
    private BigDecimal quantityChanged;
    private BigDecimal remainingStock;
    private String referenceId;
    private String notes;
    private String createdById;
    private String createdByName;
    private LocalDateTime createdAt;

    public InventoryTransactionDto() {
    }

    public InventoryTransactionDto(String id, String inventoryItemId, String inventoryItemName,
                                   String unitSymbol, InventoryTransactionType transactionType,
                                   BigDecimal quantityChanged, BigDecimal remainingStock,
                                   String referenceId, String notes, String createdById,
                                   String createdByName, LocalDateTime createdAt) {
        this.id = id;
        this.inventoryItemId = inventoryItemId;
        this.inventoryItemName = inventoryItemName;
        this.unitSymbol = unitSymbol;
        this.transactionType = transactionType;
        this.quantityChanged = quantityChanged;
        this.remainingStock = remainingStock;
        this.referenceId = referenceId;
        this.notes = notes;
        this.createdById = createdById;
        this.createdByName = createdByName;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getInventoryItemId() {
        return inventoryItemId;
    }

    public void setInventoryItemId(String inventoryItemId) {
        this.inventoryItemId = inventoryItemId;
    }

    public String getInventoryItemName() {
        return inventoryItemName;
    }

    public void setInventoryItemName(String inventoryItemName) {
        this.inventoryItemName = inventoryItemName;
    }

    public String getUnitSymbol() {
        return unitSymbol;
    }

    public void setUnitSymbol(String unitSymbol) {
        this.unitSymbol = unitSymbol;
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

    public String getCreatedById() {
        return createdById;
    }

    public void setCreatedById(String createdById) {
        this.createdById = createdById;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
