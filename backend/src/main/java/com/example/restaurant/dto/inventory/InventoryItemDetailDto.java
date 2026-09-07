package com.example.restaurant.dto.inventory;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class InventoryItemDetailDto {

    private String id;
    private String outletId;
    private String name;
    private String sku;
    private String unitId;
    private String unitName;
    private String unitSymbol;
    private BigDecimal currentStock;
    private BigDecimal minimumStock;
    private BigDecimal unitCost;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public InventoryItemDetailDto() {
    }

    public InventoryItemDetailDto(String id, String outletId, String name, String sku,
                                  String unitId, String unitName, String unitSymbol,
                                  BigDecimal currentStock, BigDecimal minimumStock,
                                  BigDecimal unitCost, String status,
                                  LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.outletId = outletId;
        this.name = name;
        this.sku = sku;
        this.unitId = unitId;
        this.unitName = unitName;
        this.unitSymbol = unitSymbol;
        this.currentStock = currentStock;
        this.minimumStock = minimumStock;
        this.unitCost = unitCost;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOutletId() {
        return outletId;
    }

    public void setOutletId(String outletId) {
        this.outletId = outletId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getUnitId() {
        return unitId;
    }

    public void setUnitId(String unitId) {
        this.unitId = unitId;
    }

    public String getUnitName() {
        return unitName;
    }

    public void setUnitName(String unitName) {
        this.unitName = unitName;
    }

    public String getUnitSymbol() {
        return unitSymbol;
    }

    public void setUnitSymbol(String unitSymbol) {
        this.unitSymbol = unitSymbol;
    }

    public BigDecimal getCurrentStock() {
        return currentStock;
    }

    public void setCurrentStock(BigDecimal currentStock) {
        this.currentStock = currentStock;
    }

    public BigDecimal getMinimumStock() {
        return minimumStock;
    }

    public void setMinimumStock(BigDecimal minimumStock) {
        this.minimumStock = minimumStock;
    }

    public BigDecimal getUnitCost() {
        return unitCost;
    }

    public void setUnitCost(BigDecimal unitCost) {
        this.unitCost = unitCost;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
