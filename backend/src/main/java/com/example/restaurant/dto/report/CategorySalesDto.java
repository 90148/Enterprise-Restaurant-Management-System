package com.example.restaurant.dto.report;

import java.math.BigDecimal;

public class CategorySalesDto {
    private String categoryId;
    private String categoryName;
    private long itemsSold;
    private BigDecimal totalRevenue = BigDecimal.ZERO;
    private double revenueSharePercentage = 0.0;

    public CategorySalesDto() {
    }

    public CategorySalesDto(String categoryId, String categoryName, long itemsSold, BigDecimal totalRevenue) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.itemsSold = itemsSold;
        this.totalRevenue = totalRevenue;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public long getItemsSold() {
        return itemsSold;
    }

    public void setItemsSold(long itemsSold) {
        this.itemsSold = itemsSold;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public double getRevenueSharePercentage() {
        return revenueSharePercentage;
    }

    public void setRevenueSharePercentage(double revenueSharePercentage) {
        this.revenueSharePercentage = revenueSharePercentage;
    }
}
