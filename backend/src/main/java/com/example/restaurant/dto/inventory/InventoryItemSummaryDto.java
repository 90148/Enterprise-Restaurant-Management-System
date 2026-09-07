package com.example.restaurant.dto.inventory;

import java.math.BigDecimal;

public class InventoryItemSummaryDto {

    private String id;
    private String name;
    private String sku;
    private String unitName;
    private String unitSymbol;
    private BigDecimal currentStock;
    private BigDecimal unitCost;

    public InventoryItemSummaryDto() {
    }

    public InventoryItemSummaryDto(String id, String name, String sku, String unitName, String unitSymbol, BigDecimal currentStock, BigDecimal unitCost) {
        this.id = id;
        this.name = name;
        this.sku = sku;
        this.unitName = unitName;
        this.unitSymbol = unitSymbol;
        this.currentStock = currentStock;
        this.unitCost = unitCost;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public BigDecimal getUnitCost() {
        return unitCost;
    }

    public void setUnitCost(BigDecimal unitCost) {
        this.unitCost = unitCost;
    }
}
