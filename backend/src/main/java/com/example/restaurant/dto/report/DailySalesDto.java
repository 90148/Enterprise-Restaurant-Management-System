package com.example.restaurant.dto.report;

import java.math.BigDecimal;
import java.time.LocalDate;

public class DailySalesDto {
    private LocalDate date;
    private BigDecimal grossSales = BigDecimal.ZERO;
    private BigDecimal netSales = BigDecimal.ZERO;
    private BigDecimal taxAmount = BigDecimal.ZERO;
    private BigDecimal discountAmount = BigDecimal.ZERO;
    private BigDecimal paidAmount = BigDecimal.ZERO;
    private long orderCount = 0;

    public DailySalesDto() {
    }

    public DailySalesDto(LocalDate date, BigDecimal grossSales, BigDecimal netSales,
                         BigDecimal taxAmount, BigDecimal discountAmount,
                         BigDecimal paidAmount, long orderCount) {
        this.date = date;
        this.grossSales = grossSales;
        this.netSales = netSales;
        this.taxAmount = taxAmount;
        this.discountAmount = discountAmount;
        this.paidAmount = paidAmount;
        this.orderCount = orderCount;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public BigDecimal getGrossSales() {
        return grossSales;
    }

    public void setGrossSales(BigDecimal grossSales) {
        this.grossSales = grossSales;
    }

    public BigDecimal getNetSales() {
        return netSales;
    }

    public void setNetSales(BigDecimal netSales) {
        this.netSales = netSales;
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

    public BigDecimal getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(BigDecimal paidAmount) {
        this.paidAmount = paidAmount;
    }

    public long getOrderCount() {
        return orderCount;
    }

    public void setOrderCount(long orderCount) {
        this.orderCount = orderCount;
    }
}
