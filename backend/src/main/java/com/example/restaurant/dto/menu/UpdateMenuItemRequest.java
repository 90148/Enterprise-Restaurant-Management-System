package com.example.restaurant.dto.menu;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.Set;

public class UpdateMenuItemRequest {

    private String categoryId;

    @NotBlank(message = "Item name is required")
    @Size(min = 2, max = 100, message = "Item name must be between 2 and 100 characters")
    private String name;

    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.00", message = "Price cannot be negative")
    private BigDecimal price;

    private BigDecimal costPrice;

    private BigDecimal taxRate;

    private String imageUrl;

    private Boolean isAvailable;

    private Integer prepTimeMinutes;

    private String specialInstructions;

    private Boolean active;

    private Set<String> modifierGroupIds;

    public UpdateMenuItemRequest() {
    }

    public UpdateMenuItemRequest(String categoryId, String name, String description, BigDecimal price, BigDecimal costPrice, BigDecimal taxRate, String imageUrl, Boolean isAvailable, Integer prepTimeMinutes, String specialInstructions, Boolean active, Set<String> modifierGroupIds) {
        this.categoryId = categoryId;
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
        this.modifierGroupIds = modifierGroupIds;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
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

    public Boolean getIsAvailable() {
        return isAvailable;
    }

    public void setIsAvailable(Boolean available) {
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

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Set<String> getModifierGroupIds() {
        return modifierGroupIds;
    }

    public void setModifierGroupIds(Set<String> modifierGroupIds) {
        this.modifierGroupIds = modifierGroupIds;
    }
}
