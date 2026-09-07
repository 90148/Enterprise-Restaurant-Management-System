package com.example.restaurant.dto.report;

import java.math.BigDecimal;

public class InventoryConsumptionSummaryDto {
    private String transactionType;
    private long count;
    private BigDecimal totalQuantity = BigDecimal.ZERO;

    public InventoryConsumptionSummaryDto() {
    }

    public InventoryConsumptionSummaryDto(String transactionType, long count, BigDecimal totalQuantity) {
        this.transactionType = transactionType;
        this.count = count;
        this.totalQuantity = totalQuantity;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }

    public BigDecimal getTotalQuantity() {
        return totalQuantity;
    }

    public void setTotalQuantity(BigDecimal totalQuantity) {
        this.totalQuantity = totalQuantity;
    }
}
