package com.example.restaurant.dto.order;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

public class CreateOrderItemRequest {

    @NotBlank(message = "Menu item ID is required")
    private String menuItemId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity = 1;

    private String notes;

    private List<String> selectedModifierIds = new ArrayList<>();

    public CreateOrderItemRequest() {
    }

    public CreateOrderItemRequest(String menuItemId, Integer quantity, String notes, List<String> selectedModifierIds) {
        this.menuItemId = menuItemId;
        this.quantity = quantity != null ? quantity : 1;
        this.notes = notes;
        this.selectedModifierIds = selectedModifierIds != null ? selectedModifierIds : new ArrayList<>();
    }

    public String getMenuItemId() {
        return menuItemId;
    }

    public void setMenuItemId(String menuItemId) {
        this.menuItemId = menuItemId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<String> getSelectedModifierIds() {
        return selectedModifierIds;
    }

    public void setSelectedModifierIds(List<String> selectedModifierIds) {
        this.selectedModifierIds = selectedModifierIds != null ? selectedModifierIds : new ArrayList<>();
    }
}
