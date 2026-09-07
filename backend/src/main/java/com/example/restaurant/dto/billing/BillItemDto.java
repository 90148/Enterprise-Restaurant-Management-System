package com.example.restaurant.dto.billing;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BillItemDto {

    private String id;
    private String orderItemId;
    private String menuItemId;
    private String itemName;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal subtotal;
    private String modifiersSummary;
    private String notes;
    private LocalDateTime createdAt;

    public BillItemDto() {
    }

    public BillItemDto(String id, String orderItemId, String menuItemId, String itemName,
                       BigDecimal unitPrice, Integer quantity, BigDecimal subtotal,
                       String modifiersSummary, String notes, LocalDateTime createdAt) {
        this.id = id;
        this.orderItemId = orderItemId;
        this.menuItemId = menuItemId;
        this.itemName = itemName;
        this.unitPrice = unitPrice;
        this.quantity = quantity;
        this.subtotal = subtotal;
        this.modifiersSummary = modifiersSummary;
        this.notes = notes;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOrderItemId() {
        return orderItemId;
    }

    public void setOrderItemId(String orderItemId) {
        this.orderItemId = orderItemId;
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

    public String getModifiersSummary() {
        return modifiersSummary;
    }

    public void setModifiersSummary(String modifiersSummary) {
        this.modifiersSummary = modifiersSummary;
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
