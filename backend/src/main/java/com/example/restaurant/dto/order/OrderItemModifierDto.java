package com.example.restaurant.dto.order;

import java.math.BigDecimal;

public class OrderItemModifierDto {
    private String id;
    private String modifierId;
    private String modifierName;
    private BigDecimal price;

    public OrderItemModifierDto() {
    }

    public OrderItemModifierDto(String id, String modifierId, String modifierName, BigDecimal price) {
        this.id = id;
        this.modifierId = modifierId;
        this.modifierName = modifierName;
        this.price = price;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getModifierId() {
        return modifierId;
    }

    public void setModifierId(String modifierId) {
        this.modifierId = modifierId;
    }

    public String getModifierName() {
        return modifierName;
    }

    public void setModifierName(String modifierName) {
        this.modifierName = modifierName;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }
}
