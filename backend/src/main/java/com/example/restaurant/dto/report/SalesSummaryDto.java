package com.example.restaurant.dto.report;

import java.math.BigDecimal;

public class SalesSummaryDto {
    private BigDecimal grossSales = BigDecimal.ZERO;
    private BigDecimal discountTotal = BigDecimal.ZERO;
    private BigDecimal netSales = BigDecimal.ZERO;
    private BigDecimal taxTotal = BigDecimal.ZERO;
    private BigDecimal totalPaid = BigDecimal.ZERO;
    private BigDecimal totalRefunds = BigDecimal.ZERO;
    private long totalOrders = 0;
    private long totalBills = 0;
    private BigDecimal averageOrderValue = BigDecimal.ZERO;

    public SalesSummaryDto() {
    }

    public SalesSummaryDto(BigDecimal grossSales, BigDecimal discountTotal, BigDecimal netSales,
                           BigDecimal taxTotal, BigDecimal totalPaid, BigDecimal totalRefunds,
                           long totalOrders, long totalBills, BigDecimal averageOrderValue) {
        this.grossSales = grossSales;
        this.discountTotal = discountTotal;
        this.netSales = netSales;
        this.taxTotal = taxTotal;
        this.totalPaid = totalPaid;
        this.totalRefunds = totalRefunds;
        this.totalOrders = totalOrders;
        this.totalBills = totalBills;
        this.averageOrderValue = averageOrderValue;
    }

    public BigDecimal getGrossSales() {
        return grossSales;
    }

    public void setGrossSales(BigDecimal grossSales) {
        this.grossSales = grossSales;
    }

    public BigDecimal getDiscountTotal() {
        return discountTotal;
    }

    public void setDiscountTotal(BigDecimal discountTotal) {
        this.discountTotal = discountTotal;
    }

    public BigDecimal getNetSales() {
        return netSales;
    }

    public void setNetSales(BigDecimal netSales) {
        this.netSales = netSales;
    }

    public BigDecimal getTaxTotal() {
        return taxTotal;
    }

    public void setTaxTotal(BigDecimal taxTotal) {
        this.taxTotal = taxTotal;
    }

    public BigDecimal getTotalPaid() {
        return totalPaid;
    }

    public void setTotalPaid(BigDecimal totalPaid) {
        this.totalPaid = totalPaid;
    }

    public BigDecimal getTotalRefunds() {
        return totalRefunds;
    }

    public void setTotalRefunds(BigDecimal totalRefunds) {
        this.totalRefunds = totalRefunds;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public long getTotalBills() {
        return totalBills;
    }

    public void setTotalBills(long totalBills) {
        this.totalBills = totalBills;
    }

    public BigDecimal getAverageOrderValue() {
        return averageOrderValue;
    }

    public void setAverageOrderValue(BigDecimal averageOrderValue) {
        this.averageOrderValue = averageOrderValue;
    }
}
