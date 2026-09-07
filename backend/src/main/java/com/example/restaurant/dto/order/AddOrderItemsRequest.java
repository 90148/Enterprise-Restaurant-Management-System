package com.example.restaurant.dto.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.List;

public class AddOrderItemsRequest {

    @NotEmpty(message = "Items list cannot be empty")
    @Valid
    private List<CreateOrderItemRequest> items = new ArrayList<>();

    public AddOrderItemsRequest() {
    }

    public AddOrderItemsRequest(List<CreateOrderItemRequest> items) {
        this.items = items != null ? items : new ArrayList<>();
    }

    public List<CreateOrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<CreateOrderItemRequest> items) {
        this.items = items != null ? items : new ArrayList<>();
    }
}
