package com.example.restaurant.dto.order;

import com.example.restaurant.entity.OrderItemStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class OrderItemDto {
    private String id;
    private String menuItemId;
    private String itemName;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal subtotal;
    private OrderItemStatus status;
    private String notes;
    private List<OrderItemModifierDto> modifiers = new ArrayList<>();
    private LocalDateTime createdAt;

    public OrderItemDto() {
    }

    public OrderItemDto(String id, String menuItemId, String itemName, BigDecimal unitPrice,
                        Integer quantity, BigDecimal subtotal, OrderItemStatus status,
                        String notes, List<OrderItemModifierDto> modifiers, LocalDateTime createdAt) {
        this.id = id;
        this.menuItemId = menuItemId;
        this.itemName = itemName;
        this.unitPrice = unitPrice;
        this.quantity = quantity;
        this.subtotal = subtotal;
        this.status = status;
        this.notes = notes;
        this.modifiers = modifiers != null ? modifiers : new ArrayList<>();
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

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public OrderItemStatus getStatus() {
        return status;
    }

    public void setStatus(OrderItemStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<OrderItemModifierDto> getModifiers() {
        return modifiers;
    }

    public void setModifiers(List<OrderItemModifierDto> modifiers) {
        this.modifiers = modifiers != null ? modifiers : new ArrayList<>();
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
