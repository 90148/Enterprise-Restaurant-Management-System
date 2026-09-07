package com.example.restaurant.dto.setting;

import java.math.BigDecimal;

public class TaxDto {
    private String id;
    private String outletId;
    private String name;
    private BigDecimal percentage;
    private boolean isInclusive;
    private boolean active;

    public TaxDto() {
    }

    public TaxDto(String id, String outletId, String name, BigDecimal percentage, boolean isInclusive, boolean active) {
        this.id = id;
        this.outletId = outletId;
        this.name = name;
        this.percentage = percentage;
        this.isInclusive = isInclusive;
        this.active = active;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getPercentage() {
        return percentage;
    }

    public void setPercentage(BigDecimal percentage) {
        this.percentage = percentage;
    }

    public boolean isInclusive() {
        return isInclusive;
    }

    public void setInclusive(boolean inclusive) {
        isInclusive = inclusive;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
