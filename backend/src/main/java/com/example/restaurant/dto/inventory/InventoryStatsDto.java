package com.example.restaurant.dto.inventory;

import java.math.BigDecimal;

public class InventoryStatsDto {

    private long totalItems;
    private long lowStockCount;
    private long outOfStockCount;
    private BigDecimal totalValuation;
    private long todayPurchasesCount;
    private BigDecimal todayRefundsTotal;

    public InventoryStatsDto() {
    }

    public InventoryStatsDto(long totalItems, long lowStockCount, long outOfStockCount,
                             BigDecimal totalValuation, long todayPurchasesCount, BigDecimal todayRefundsTotal) {
        this.totalItems = totalItems;
        this.lowStockCount = lowStockCount;
        this.outOfStockCount = outOfStockCount;
        this.totalValuation = totalValuation != null ? totalValuation : BigDecimal.ZERO;
        this.todayPurchasesCount = todayPurchasesCount;
        this.todayRefundsTotal = todayRefundsTotal != null ? todayRefundsTotal : BigDecimal.ZERO;
    }

    public long getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(long totalItems) {
        this.totalItems = totalItems;
    }

    public long getLowStockCount() {
        return lowStockCount;
    }

    public void setLowStockCount(long lowStockCount) {
        this.lowStockCount = lowStockCount;
    }

    public long getOutOfStockCount() {
        return outOfStockCount;
    }

    public void setOutOfStockCount(long outOfStockCount) {
        this.outOfStockCount = outOfStockCount;
    }

    public BigDecimal getTotalValuation() {
        return totalValuation;
    }

    public void setTotalValuation(BigDecimal totalValuation) {
        this.totalValuation = totalValuation;
    }

    public long getTodayPurchasesCount() {
        return todayPurchasesCount;
    }

    public void setTodayPurchasesCount(long todayPurchasesCount) {
        this.todayPurchasesCount = todayPurchasesCount;
    }

    public BigDecimal getTodayRefundsTotal() {
        return todayRefundsTotal;
    }

    public void setTodayRefundsTotal(BigDecimal todayRefundsTotal) {
        this.todayRefundsTotal = todayRefundsTotal;
    }
}
