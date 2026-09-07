package com.example.restaurant.dto.billing;

import java.math.BigDecimal;

public class BillingStatsDto {

    private long totalBillsToday;
    private long unpaidBills;
    private long paidBills;
    private BigDecimal todayRevenue;

    public BillingStatsDto() {
    }

    public BillingStatsDto(long totalBillsToday, long unpaidBills, long paidBills, BigDecimal todayRevenue) {
        this.totalBillsToday = totalBillsToday;
        this.unpaidBills = unpaidBills;
        this.paidBills = paidBills;
        this.todayRevenue = todayRevenue != null ? todayRevenue : BigDecimal.ZERO;
    }

    public long getTotalBillsToday() {
        return totalBillsToday;
    }

    public void setTotalBillsToday(long totalBillsToday) {
        this.totalBillsToday = totalBillsToday;
    }

    public long getUnpaidBills() {
        return unpaidBills;
    }

    public void setUnpaidBills(long unpaidBills) {
        this.unpaidBills = unpaidBills;
    }

    public long getPaidBills() {
        return paidBills;
    }

    public void setPaidBills(long paidBills) {
        this.paidBills = paidBills;
    }

    public BigDecimal getTodayRevenue() {
        return todayRevenue;
    }

    public void setTodayRevenue(BigDecimal todayRevenue) {
        this.todayRevenue = todayRevenue;
    }
}
