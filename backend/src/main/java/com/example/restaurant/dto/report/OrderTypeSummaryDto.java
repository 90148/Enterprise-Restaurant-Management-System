package com.example.restaurant.dto.report;

import java.math.BigDecimal;

public class OrderTypeSummaryDto {
    private String orderType;
    private long count;
    private BigDecimal amount = BigDecimal.ZERO;
    private double percentage = 0.0;

    public OrderTypeSummaryDto() {
    }

    public OrderTypeSummaryDto(String orderType, long count, BigDecimal amount, double percentage) {
        this.orderType = orderType;
        this.count = count;
        this.amount = amount;
        this.percentage = percentage;
    }

    public String getOrderType() {
        return orderType;
    }

    public void setOrderType(String orderType) {
        this.orderType = orderType;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public double getPercentage() {
        return percentage;
    }

    public void setPercentage(double percentage) {
        this.percentage = percentage;
    }
}
