package com.example.restaurant.dto.report;

import java.math.BigDecimal;

public class HourlySalesDto {
    private int hour;
    private String label;
    private BigDecimal revenue = BigDecimal.ZERO;
    private long orderCount = 0;

    public HourlySalesDto() {
    }

    public HourlySalesDto(int hour, String label, BigDecimal revenue, long orderCount) {
        this.hour = hour;
        this.label = label;
        this.revenue = revenue;
        this.orderCount = orderCount;
    }

    public int getHour() {
        return hour;
    }

    public void setHour(int hour) {
        this.hour = hour;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public BigDecimal getRevenue() {
        return revenue;
    }

    public void setRevenue(BigDecimal revenue) {
        this.revenue = revenue;
    }

    public long getOrderCount() {
        return orderCount;
    }

    public void setOrderCount(long orderCount) {
        this.orderCount = orderCount;
    }
}
