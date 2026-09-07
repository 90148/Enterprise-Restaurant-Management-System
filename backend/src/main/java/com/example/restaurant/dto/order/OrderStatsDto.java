package com.example.restaurant.dto.order;

public class OrderStatsDto {
    private long totalOrders;
    private long activeOrders;
    private long completedOrders;
    private long cancelledOrders;

    public OrderStatsDto() {
    }

    public OrderStatsDto(long totalOrders, long activeOrders, long completedOrders, long cancelledOrders) {
        this.totalOrders = totalOrders;
        this.activeOrders = activeOrders;
        this.completedOrders = completedOrders;
        this.cancelledOrders = cancelledOrders;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public long getActiveOrders() {
        return activeOrders;
    }

    public void setActiveOrders(long activeOrders) {
        this.activeOrders = activeOrders;
    }

    public long getCompletedOrders() {
        return completedOrders;
    }

    public void setCompletedOrders(long completedOrders) {
        this.completedOrders = completedOrders;
    }

    public long getCancelledOrders() {
        return cancelledOrders;
    }

    public void setCancelledOrders(long cancelledOrders) {
        this.cancelledOrders = cancelledOrders;
    }
}
