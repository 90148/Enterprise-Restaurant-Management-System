package com.example.restaurant.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "kot_items")
public class KotItem {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kot_id", nullable = false)
    private Kot kot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id")
    private OrderItem orderItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id")
    private MenuItem menuItem;

    @Column(name = "item_name", nullable = false, length = 100)
    private String itemName;

    @Column(nullable = false)
    private Integer quantity = 1;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderItemStatus status = OrderItemStatus.PENDING;

    @Column(name = "modifiers_summary", columnDefinition = "TEXT")
    private String modifiersSummary;

    @Column(name = "kitchen_station", length = 50)
    private String kitchenStation = "MAIN_KITCHEN";

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public KotItem() {
    }

    public KotItem(String id, Kot kot, OrderItem orderItem, MenuItem menuItem,
                   String itemName, Integer quantity, String modifiersSummary,
                   String kitchenStation, String notes) {
        this.id = id;
        this.kot = kot;
        this.orderItem = orderItem;
        this.menuItem = menuItem;
        this.itemName = itemName;
        this.quantity = quantity != null ? quantity : 1;
        this.modifiersSummary = modifiersSummary;
        this.kitchenStation = kitchenStation != null ? kitchenStation : "MAIN_KITCHEN";
        this.notes = notes;
        this.status = OrderItemStatus.PENDING;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Kot getKot() {
        return kot;
    }

    public void setKot(Kot kot) {
        this.kot = kot;
    }

    public OrderItem getOrderItem() {
        return orderItem;
    }

    public void setOrderItem(OrderItem orderItem) {
        this.orderItem = orderItem;
    }

    public MenuItem getMenuItem() {
        return menuItem;
    }

    public void setMenuItem(MenuItem menuItem) {
        this.menuItem = menuItem;
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
