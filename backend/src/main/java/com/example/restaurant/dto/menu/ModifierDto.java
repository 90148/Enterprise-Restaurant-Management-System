package com.example.restaurant.dto.menu;

import java.math.BigDecimal;

public class ModifierDto {

    private String id;
    private String modifierGroupId;
    private String name;
    private BigDecimal price;
    private boolean active;

    public ModifierDto() {
    }

    public ModifierDto(String id, String modifierGroupId, String name, BigDecimal price, boolean active) {
        this.id = id;
        this.modifierGroupId = modifierGroupId;
        this.name = name;
        this.price = price != null ? price : BigDecimal.ZERO;
        this.active = active;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getModifierGroupId() {
        return modifierGroupId;
    }

    public void setModifierGroupId(String modifierGroupId) {
        this.modifierGroupId = modifierGroupId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
