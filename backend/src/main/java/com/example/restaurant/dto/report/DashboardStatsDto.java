package com.example.restaurant.dto.report;

import com.example.restaurant.dto.inventory.InventoryItemSummaryDto;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class DashboardStatsDto {
    private BigDecimal todayRevenue = BigDecimal.ZERO;
    private BigDecimal yesterdayRevenue = BigDecimal.ZERO;
    private double revenueTrendPercent = 0.0;
    private long activeTables = 0;
    private long totalTables = 0;
    private long availableTables = 0;
    private long liveOrders = 0;
    private long todayCompletedOrders = 0;
    private double ordersTrendPercent = 0.0;
    private List<HourlySalesDto> hourlyTrend = new ArrayList<>();
    private List<InventoryItemSummaryDto> lowStockAlerts = new ArrayList<>();

    public DashboardStatsDto() {
    }

    public BigDecimal getTodayRevenue() {
        return todayRevenue;
    }

    public void setTodayRevenue(BigDecimal todayRevenue) {
        this.todayRevenue = todayRevenue;
    }

    public BigDecimal getYesterdayRevenue() {
        return yesterdayRevenue;
    }

    public void setYesterdayRevenue(BigDecimal yesterdayRevenue) {
        this.yesterdayRevenue = yesterdayRevenue;
    }

    public double getRevenueTrendPercent() {
        return revenueTrendPercent;
    }

    public void setRevenueTrendPercent(double revenueTrendPercent) {
        this.revenueTrendPercent = revenueTrendPercent;
    }

    public long getActiveTables() {
        return activeTables;
    }

    public void setActiveTables(long activeTables) {
        this.activeTables = activeTables;
    }

    public long getTotalTables() {
        return totalTables;
    }

    public void setTotalTables(long totalTables) {
        this.totalTables = totalTables;
    }

    public long getAvailableTables() {
        return availableTables;
    }

    public void setAvailableTables(long availableTables) {
        this.availableTables = availableTables;
    }

    public long getLiveOrders() {
        return liveOrders;
    }

    public void setLiveOrders(long liveOrders) {
        this.liveOrders = liveOrders;
    }

    public long getTodayCompletedOrders() {
        return todayCompletedOrders;
    }

    public void setTodayCompletedOrders(long todayCompletedOrders) {
        this.todayCompletedOrders = todayCompletedOrders;
    }

    public double getOrdersTrendPercent() {
        return ordersTrendPercent;
    }

    public void setOrdersTrendPercent(double ordersTrendPercent) {
        this.ordersTrendPercent = ordersTrendPercent;
    }

    public List<HourlySalesDto> getHourlyTrend() {
        return hourlyTrend;
    }

    public void setHourlyTrend(List<HourlySalesDto> hourlyTrend) {
        this.hourlyTrend = hourlyTrend;
    }

    public List<InventoryItemSummaryDto> getLowStockAlerts() {
        return lowStockAlerts;
    }

    public void setLowStockAlerts(List<InventoryItemSummaryDto> lowStockAlerts) {
        this.lowStockAlerts = lowStockAlerts;
    }
}
