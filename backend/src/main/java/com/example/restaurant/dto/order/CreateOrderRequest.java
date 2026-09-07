package com.example.restaurant.dto.order;

import com.example.restaurant.entity.OrderType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

public class CreateOrderRequest {

    @NotNull(message = "Outlet ID is required")
    private String outletId;

    private String tableId;

    @NotNull(message = "Order type is required")
    private OrderType orderType = OrderType.DINE_IN;

    private String customerName;

    private String customerPhone;

    private Integer guestCount = 1;

    private String notes;

    @NotEmpty(message = "Order must contain at least one item")
    @Valid
    private List<CreateOrderItemRequest> items = new ArrayList<>();

    public CreateOrderRequest() {
    }

    public CreateOrderRequest(String outletId, String tableId, OrderType orderType,
                              String customerName, String customerPhone, Integer guestCount,
                              String notes, List<CreateOrderItemRequest> items) {
        this.outletId = outletId;
        this.tableId = tableId;
        this.orderType = orderType != null ? orderType : OrderType.DINE_IN;
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.guestCount = guestCount != null ? guestCount : 1;
        this.notes = notes;
        this.items = items != null ? items : new ArrayList<>();
    }

    public String getOutletId() {
        return outletId;
    }

    public void setOutletId(String outletId) {
        this.outletId = outletId;
    }

    public String getTableId() {
        return tableId;
    }

    public void setTableId(String tableId) {
        this.tableId = tableId;
    }

    public OrderType getOrderType() {
        return orderType;
    }

    public void setOrderType(OrderType orderType) {
        this.orderType = orderType;
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<CreateOrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<CreateOrderItemRequest> items) {
        this.items = items != null ? items : new ArrayList<>();
    }
}
