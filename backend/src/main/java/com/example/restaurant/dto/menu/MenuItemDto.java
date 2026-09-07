package com.example.restaurant.dto.menu;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class MenuItemDto {

    private String id;
    private String categoryId;
    private String categoryName;
    private String outletId;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal costPrice;
    private BigDecimal taxRate;
    private String imageUrl;
    private boolean isAvailable;
    private Integer prepTimeMinutes;
    private String specialInstructions;
    private boolean active;
    private BigDecimal profitMargin;
    private boolean hasRecipe;
    private List<ModifierGroupDto> modifierGroups = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public MenuItemDto() {
    }

    public MenuItemDto(String id, String categoryId, String categoryName, String outletId, String name,
                       String description, BigDecimal price, BigDecimal costPrice, BigDecimal taxRate,
                       String imageUrl, boolean isAvailable, Integer prepTimeMinutes, String specialInstructions,
                       boolean active, BigDecimal profitMargin, boolean hasRecipe, List<ModifierGroupDto> modifierGroups,
                       LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.outletId = outletId;
        this.name = name;
        this.description = description;
        this.price = price;
        this.costPrice = costPrice;
        this.taxRate = taxRate;
        this.imageUrl = imageUrl;
        this.isAvailable = isAvailable;
        this.prepTimeMinutes = prepTimeMinutes;
        this.specialInstructions = specialInstructions;
        this.active = active;
        this.profitMargin = profitMargin;
        this.hasRecipe = hasRecipe;
        this.modifierGroups = modifierGroups != null ? modifierGroups : new ArrayList<>();
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getCostPrice() {
        return costPrice;
    }

    public void setCostPrice(BigDecimal costPrice) {
        this.costPrice = costPrice;
    }

    public BigDecimal getTaxRate() {
        return taxRate;
    }

    public void setTaxRate(BigDecimal taxRate) {
        this.taxRate = taxRate;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public boolean isAvailable() {
        return isAvailable;
    }

    public void setAvailable(boolean available) {
        isAvailable = available;
    }

    public Integer getPrepTimeMinutes() {
        return prepTimeMinutes;
    }

    public void setPrepTimeMinutes(Integer prepTimeMinutes) {
        this.prepTimeMinutes = prepTimeMinutes;
    }

    public String getSpecialInstructions() {
        return specialInstructions;
    }

    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public BigDecimal getProfitMargin() {
        return profitMargin;
    }

    public void setProfitMargin(BigDecimal profitMargin) {
        this.profitMargin = profitMargin;
    }

    public boolean isHasRecipe() {
        return hasRecipe;
    }

    public void setHasRecipe(boolean hasRecipe) {
        this.hasRecipe = hasRecipe;
    }

    public List<ModifierGroupDto> getModifierGroups() {
        return modifierGroups;
    }

    public void setModifierGroups(List<ModifierGroupDto> modifierGroups) {
        this.modifierGroups = modifierGroups;
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
