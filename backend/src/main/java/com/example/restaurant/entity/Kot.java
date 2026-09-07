package com.example.restaurant.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "kots")
public class Kot {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "outlet_id")
    private Outlet outlet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "kot_number", nullable = false, unique = true, length = 30)
    private String kotNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "table_id")
    private RestaurantTable table;

    @Column(name = "server_name", length = 100)
    private String serverName;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_type", length = 20)
    private OrderType orderType = OrderType.DINE_IN;

    @Column(name = "round_number")
    private Integer roundNumber = 1;

    @Column(length = 50)
    private String station = "MAIN_KITCHEN";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private KotStatus status = KotStatus.NEW;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "kot", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<KotItem> items = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Kot() {
    }

    public Kot(String id, Outlet outlet, Order order, String kotNumber, RestaurantTable table,
               String serverName, OrderType orderType, Integer roundNumber, String station, String notes) {
        this.id = id;
        this.outlet = outlet;
        this.order = order;
        this.kotNumber = kotNumber;
        this.table = table;
        this.serverName = serverName;
        this.orderType = orderType != null ? orderType : OrderType.DINE_IN;
        this.roundNumber = roundNumber != null ? roundNumber : 1;
        this.station = station != null ? station : "MAIN_KITCHEN";
        this.notes = notes;
        this.status = KotStatus.NEW;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void addItem(KotItem item) {
        items.add(item);
        item.setKot(this);
    }

    public void removeItem(KotItem item) {
        items.remove(item);
        item.setKot(null);
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Outlet getOutlet() {
        return outlet;
    }

    public void setOutlet(Outlet outlet) {
        this.outlet = outlet;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public String getKotNumber() {
        return kotNumber;
    }

    public void setKotNumber(String kotNumber) {
        this.kotNumber = kotNumber;
    }

    public RestaurantTable getTable() {
        return table;
    }

    public void setTable(RestaurantTable table) {
        this.table = table;
    }

    public String getServerName() {
        return serverName;
    }

    public void setServerName(String serverName) {
        this.serverName = serverName;
    }

    public OrderType getOrderType() {
        return orderType;
    }

    public void setOrderType(OrderType orderType) {
        this.orderType = orderType;
    }

    public Integer getRoundNumber() {
        return roundNumber;
    }

    public void setRoundNumber(Integer roundNumber) {
        this.roundNumber = roundNumber;
    }

    public String getStation() {
        return station;
    }

    public void setStation(String station) {
        this.station = station;
    }

    public KotStatus getStatus() {
        return status;
    }

    public void setStatus(KotStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<KotItem> getItems() {
        return items;
    }

    public void setItems(List<KotItem> items) {
        this.items = items != null ? items : new ArrayList<>();
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
