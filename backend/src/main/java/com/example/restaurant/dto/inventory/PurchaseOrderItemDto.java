package com.example.restaurant.dto.inventory;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PurchaseOrderItemDto {

    private String id;
    private String inventoryItemId;
    private String inventoryItemName;
    private String sku;
    private String unitSymbol;
    private BigDecimal quantity;
    private BigDecimal unitCost;
    private BigDecimal subtotal;
    private LocalDateTime createdAt;

    public PurchaseOrderItemDto() {
    }

    public PurchaseOrderItemDto(String id, String inventoryItemId, String inventoryItemName,
                                String sku, String unitSymbol, BigDecimal quantity,
                                BigDecimal unitCost, BigDecimal subtotal, LocalDateTime createdAt) {
        this.id = id;
        this.inventoryItemId = inventoryItemId;
        this.inventoryItemName = inventoryItemName;
        this.sku = sku;
        this.unitSymbol = unitSymbol;
        this.quantity = quantity;
        this.unitCost = unitCost;
        this.subtotal = subtotal;
        this.createdAt = createdAt;
    }

    public PurchaseOrderItemDto(String id, String inventoryItemId, String inventoryItemName,
                                String sku, String unitSymbol, BigDecimal quantity,
                                BigDecimal unitCost, BigDecimal subtotal) {
        this(id, inventoryItemId, inventoryItemName, sku, unitSymbol, quantity, unitCost, subtotal, LocalDateTime.now());
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

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getUnitSymbol() {
        return unitSymbol;
    }

    public void setUnitSymbol(String unitSymbol) {
        this.unitSymbol = unitSymbol;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getUnitCost() {
        return unitCost;
    }

    public void setUnitCost(BigDecimal unitCost) {
        this.unitCost = unitCost;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
