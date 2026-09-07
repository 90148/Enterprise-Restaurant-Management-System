package com.example.restaurant.dto.kot;

import com.example.restaurant.entity.OrderItemStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateKotItemStatusRequest {

    @NotNull(message = "Item status is required")
    private OrderItemStatus status;

    public UpdateKotItemStatusRequest() {
    }

    public UpdateKotItemStatusRequest(OrderItemStatus status) {
        this.status = status;
    }

    public OrderItemStatus getStatus() {
        return status;
    }

    public void setStatus(OrderItemStatus status) {
        this.status = status;
    }
}
