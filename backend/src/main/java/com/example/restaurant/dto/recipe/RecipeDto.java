package com.example.restaurant.dto.recipe;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class RecipeDto {

    private String id;
    private String menuItemId;
    private String menuItemName;
    private BigDecimal menuItemPrice;
    private String instructions;
    private List<RecipeItemDto> items = new ArrayList<>();
    private BigDecimal totalCost;
    private BigDecimal profitMargin;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public RecipeDto() {
    }

    public RecipeDto(String id, String menuItemId, String menuItemName, BigDecimal menuItemPrice,
                     String instructions, List<RecipeItemDto> items, BigDecimal totalCost,
                     BigDecimal profitMargin, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.menuItemId = menuItemId;
        this.menuItemName = menuItemName;
        this.menuItemPrice = menuItemPrice;
        this.instructions = instructions;
        this.items = items != null ? items : new ArrayList<>();
        this.totalCost = totalCost;
        this.profitMargin = profitMargin;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getMenuItemId() {
        return menuItemId;
    }

    public void setMenuItemId(String menuItemId) {
        this.menuItemId = menuItemId;
    }

    public String getMenuItemName() {
        return menuItemName;
    }

    public void setMenuItemName(String menuItemName) {
        this.menuItemName = menuItemName;
    }

    public BigDecimal getMenuItemPrice() {
        return menuItemPrice;
    }

    public void setMenuItemPrice(BigDecimal menuItemPrice) {
        this.menuItemPrice = menuItemPrice;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public List<RecipeItemDto> getItems() {
        return items;
    }

    public void setItems(List<RecipeItemDto> items) {
        this.items = items;
    }

    public BigDecimal getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(BigDecimal totalCost) {
        this.totalCost = totalCost;
    }

    public BigDecimal getProfitMargin() {
        return profitMargin;
    }

    public void setProfitMargin(BigDecimal profitMargin) {
        this.profitMargin = profitMargin;
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
