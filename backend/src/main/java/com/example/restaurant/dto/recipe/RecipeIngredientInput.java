package com.example.restaurant.dto.recipe;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class RecipeIngredientInput {

    @NotBlank(message = "Inventory item ID is required")
    private String inventoryItemId;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.001", message = "Quantity must be greater than zero")
    private BigDecimal quantity;

    public RecipeIngredientInput() {
    }

    public RecipeIngredientInput(String inventoryItemId, BigDecimal quantity) {
        this.inventoryItemId = inventoryItemId;
        this.quantity = quantity;
    }

    public String getInventoryItemId() {
        return inventoryItemId;
    }

    public void setInventoryItemId(String inventoryItemId) {
        this.inventoryItemId = inventoryItemId;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }
}
