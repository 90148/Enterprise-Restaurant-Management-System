package com.example.restaurant.dto.report;

import java.math.BigDecimal;

public class TopSellingItemDto {
    private String menuItemId;
    private String itemName;
    private String categoryName;
    private long quantitySold;
    private BigDecimal totalRevenue = BigDecimal.ZERO;
    private BigDecimal averagePrice = BigDecimal.ZERO;
    private double revenueSharePercentage = 0.0;

    public TopSellingItemDto() {
    }

    public TopSellingItemDto(String menuItemId, String itemName, String categoryName,
                             long quantitySold, BigDecimal totalRevenue, BigDecimal averagePrice) {
        this.menuItemId = menuItemId;
        this.itemName = itemName;
        this.categoryName = categoryName;
        this.quantitySold = quantitySold;
        this.totalRevenue = totalRevenue;
        this.averagePrice = averagePrice;
    }

    public String getMenuItemId() {
        return menuItemId;
    }

    public void setMenuItemId(String menuItemId) {
        this.menuItemId = menuItemId;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public long getQuantitySold() {
        return quantitySold;
    }

    public void setQuantitySold(long quantitySold) {
        this.quantitySold = quantitySold;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public BigDecimal getAveragePrice() {
        return averagePrice;
    }

    public void setAveragePrice(BigDecimal averagePrice) {
        this.averagePrice = averagePrice;
    }

    public double getRevenueSharePercentage() {
        return revenueSharePercentage;
    }

    public void setRevenueSharePercentage(double revenueSharePercentage) {
        this.revenueSharePercentage = revenueSharePercentage;
    }
}
