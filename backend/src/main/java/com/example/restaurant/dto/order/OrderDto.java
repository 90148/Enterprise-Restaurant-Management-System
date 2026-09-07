package com.example.restaurant.dto.order;

import com.example.restaurant.entity.OrderStatus;
import com.example.restaurant.entity.OrderType;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class OrderDto {
    private String id;
    private String outletId;
    private String outletName;
    private String orderNumber;
    private String tableId;
    private String tableNumber;
    private String floorName;
    private String customerName;
    private String customerPhone;
    private Integer guestCount;
    private OrderType orderType;
    private OrderStatus status;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private String notes;
    private String createdById;
    private String createdByName;
    private List<OrderItemDto> items = new ArrayList<>();
    private Integer itemCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public OrderDto() {
    }

    public OrderDto(String id, String outletId, String outletName, String orderNumber,
                    String tableId, String tableNumber, String floorName,
                    String customerName, String customerPhone, Integer guestCount,
                    OrderType orderType, OrderStatus status, BigDecimal subtotal,
                    BigDecimal taxAmount, BigDecimal discountAmount, BigDecimal totalAmount,
                    String notes, String createdById, String createdByName,
                    List<OrderItemDto> items, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.outletId = outletId;
        this.outletName = outletName;
        this.orderNumber = orderNumber;
        this.tableId = tableId;
        this.tableNumber = tableNumber;
        this.floorName = floorName;
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.guestCount = guestCount;
        this.orderType = orderType;
        this.status = status;
        this.subtotal = subtotal;
        this.taxAmount = taxAmount;
        this.discountAmount = discountAmount;
        this.totalAmount = totalAmount;
        this.notes = notes;
        this.createdById = createdById;
        this.createdByName = createdByName;
        this.items = items != null ? items : new ArrayList<>();
        this.itemCount = this.items.stream().mapToInt(OrderItemDto::getQuantity).sum();
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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

    public String getOutletName() {
        return outletName;
    }

    public void setOutletName(String outletName) {
        this.outletName = outletName;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
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

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public Integer getGuestCount() {
        return guestCount;
    }

    public void setGuestCount(Integer guestCount) {
        this.guestCount = guestCount;
    }

    public OrderType getOrderType() {
        return orderType;
    }

    public void setOrderType(OrderType orderType) {
        this.orderType = orderType;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getCreatedById() {
        return createdById;
    }

    public void setCreatedById(String createdById) {
        this.createdById = createdById;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }

    public List<OrderItemDto> getItems() {
        return items;
    }

    public void setItems(List<OrderItemDto> items) {
        this.items = items != null ? items : new ArrayList<>();
        this.itemCount = this.items.stream().mapToInt(OrderItemDto::getQuantity).sum();
    }

    public Integer getItemCount() {
        return itemCount != null ? itemCount : (items != null ? items.stream().mapToInt(OrderItemDto::getQuantity).sum() : 0);
    }

    public void setItemCount(Integer itemCount) {
        this.itemCount = itemCount;
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
