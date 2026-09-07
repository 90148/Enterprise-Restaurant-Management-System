package com.example.restaurant.dto.recipe;

import java.math.BigDecimal;

public class RecipeItemDto {

    private String id;
    private String inventoryItemId;
    private String ingredientName;
    private String sku;
    private BigDecimal quantity;
    private String unitName;
    private String unitSymbol;
    private BigDecimal unitCost;
    private BigDecimal totalCost;

    public RecipeItemDto() {
    }

    public RecipeItemDto(String id, String inventoryItemId, String ingredientName, String sku, BigDecimal quantity, String unitName, String unitSymbol, BigDecimal unitCost, BigDecimal totalCost) {
        this.id = id;
        this.inventoryItemId = inventoryItemId;
        this.ingredientName = ingredientName;
        this.sku = sku;
        this.quantity = quantity;
        this.unitName = unitName;
        this.unitSymbol = unitSymbol;
        this.unitCost = unitCost;
        this.totalCost = totalCost;
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

    public String getIngredientName() {
        return ingredientName;
    }

    public void setIngredientName(String ingredientName) {
        this.ingredientName = ingredientName;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
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

    public BigDecimal getUnitCost() {
        return unitCost;
    }

    public void setUnitCost(BigDecimal unitCost) {
        this.unitCost = unitCost;
    }

    public BigDecimal getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(BigDecimal totalCost) {
        this.totalCost = totalCost;
    }
}
