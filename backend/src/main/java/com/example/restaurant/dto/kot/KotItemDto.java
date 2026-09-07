package com.example.restaurant.dto.kot;

import com.example.restaurant.entity.OrderItemStatus;
import java.time.LocalDateTime;

public class KotItemDto {
    private String id;
    private String menuItemId;
    private String orderItemId;
    private String itemName;
    private Integer quantity;
    private OrderItemStatus status;
    private String modifiersSummary;
    private String kitchenStation;
    private String notes;
    private LocalDateTime createdAt;

    public KotItemDto() {
    }

    public KotItemDto(String id, String menuItemId, String orderItemId, String itemName,
                      Integer quantity, OrderItemStatus status, String modifiersSummary,
                      String kitchenStation, String notes, LocalDateTime createdAt) {
        this.id = id;
        this.menuItemId = menuItemId;
        this.orderItemId = orderItemId;
        this.itemName = itemName;
        this.quantity = quantity;
        this.status = status;
        this.modifiersSummary = modifiersSummary;
        this.kitchenStation = kitchenStation;
        this.notes = notes;
        this.createdAt = createdAt;
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

    public String getOrderItemId() {
        return orderItemId;
    }

    public void setOrderItemId(String orderItemId) {
        this.orderItemId = orderItemId;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public OrderItemStatus getStatus() {
        return status;
    }

    public void setStatus(OrderItemStatus status) {
        this.status = status;
    }

    public String getModifiersSummary() {
        return modifiersSummary;
    }

    public void setModifiersSummary(String modifiersSummary) {
        this.modifiersSummary = modifiersSummary;
    }

    public String getKitchenStation() {
        return kitchenStation;
    }

    public void setKitchenStation(String kitchenStation) {
        this.kitchenStation = kitchenStation;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
