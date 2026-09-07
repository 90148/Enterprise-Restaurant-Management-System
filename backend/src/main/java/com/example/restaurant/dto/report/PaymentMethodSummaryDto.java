package com.example.restaurant.dto.report;

import java.math.BigDecimal;

public class PaymentMethodSummaryDto {
    private String paymentMethod;
    private long count;
    private BigDecimal amount = BigDecimal.ZERO;
    private double percentage = 0.0;

    public PaymentMethodSummaryDto() {
    }

    public PaymentMethodSummaryDto(String paymentMethod, long count, BigDecimal amount, double percentage) {
        this.paymentMethod = paymentMethod;
        this.count = count;
        this.amount = amount;
        this.percentage = percentage;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
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
