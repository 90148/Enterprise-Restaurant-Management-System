package com.example.restaurant.dto.kot;

import com.example.restaurant.entity.KotStatus;
import com.example.restaurant.entity.OrderType;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class KotDto {
    private String id;
    private String outletId;
    private String orderId;
    private String orderNumber;
    private String kotNumber;
    private String tableId;
    private String tableNumber;
    private String floorName;
    private String customerName;
    private String serverName;
    private OrderType orderType;
    private Integer roundNumber;
    private String station;
    private KotStatus status;
    private String notes;
    private List<KotItemDto> items = new ArrayList<>();
    private Integer itemCount;
    private Long elapsedMinutes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public KotDto() {
    }

    public KotDto(String id, String outletId, String orderId, String orderNumber,
                  String kotNumber, String tableId, String tableNumber, String floorName,
                  String customerName, String serverName, OrderType orderType,
                  Integer roundNumber, String station, KotStatus status, String notes,
                  List<KotItemDto> items, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.outletId = outletId;
        this.orderId = orderId;
        this.orderNumber = orderNumber;
        this.kotNumber = kotNumber;
        this.tableId = tableId;
        this.tableNumber = tableNumber;
        this.floorName = floorName;
        this.customerName = customerName;
        this.serverName = serverName;
        this.orderType = orderType;
        this.roundNumber = roundNumber != null ? roundNumber : 1;
        this.station = station != null ? station : "MAIN_KITCHEN";
        this.status = status;
        this.notes = notes;
        this.items = items != null ? items : new ArrayList<>();
        this.itemCount = this.items.stream().mapToInt(KotItemDto::getQuantity).sum();
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.elapsedMinutes = createdAt != null ? Duration.between(createdAt, LocalDateTime.now()).toMinutes() : 0L;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOutletId() {
        return outletId;
    }

    public void setOutletId(String outletId) {
        this.outletId = outletId;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public String getKotNumber() {
        return kotNumber;
    }

    public void setKotNumber(String kotNumber) {
        this.kotNumber = kotNumber;
    }

    public String getTableId() {
        return tableId;
    }

    public void setTableId(String tableId) {
        this.tableId = tableId;
    }

    public String getTableNumber() {
        return tableNumber;
    }

    public void setTableNumber(String tableNumber) {
        this.tableNumber = tableNumber;
    }

    public String getFloorName() {
        return floorName;
    }

    public void setFloorName(String floorName) {
        this.floorName = floorName;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
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

    public List<KotItemDto> getItems() {
        return items;
    }

    public void setItems(List<KotItemDto> items) {
        this.items = items != null ? items : new ArrayList<>();
        this.itemCount = this.items.stream().mapToInt(KotItemDto::getQuantity).sum();
    }

    public Integer getItemCount() {
        return itemCount != null ? itemCount : (items != null ? items.stream().mapToInt(KotItemDto::getQuantity).sum() : 0);
    }

    public void setItemCount(Integer itemCount) {
        this.itemCount = itemCount;
    }

    public Long getElapsedMinutes() {
        return createdAt != null ? Duration.between(createdAt, LocalDateTime.now()).toMinutes() : elapsedMinutes;
    }

    public void setElapsedMinutes(Long elapsedMinutes) {
        this.elapsedMinutes = elapsedMinutes;
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
