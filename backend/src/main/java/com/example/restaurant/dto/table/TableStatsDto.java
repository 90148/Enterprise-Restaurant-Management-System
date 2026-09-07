package com.example.restaurant.dto.table;

public class TableStatsDto {

    private String outletId;
    private long totalTables;
    private long availableTables;
    private long occupiedTables;
    private long reservedTables;
    private long billingTables;

    public TableStatsDto() {
    }

    public TableStatsDto(String outletId, long totalTables, long availableTables, long occupiedTables, long reservedTables, long billingTables) {
        this.outletId = outletId;
        this.totalTables = totalTables;
        this.availableTables = availableTables;
        this.occupiedTables = occupiedTables;
        this.reservedTables = reservedTables;
        this.billingTables = billingTables;
    }

    public String getOutletId() {
        return outletId;
    }

    public void setOutletId(String outletId) {
        this.outletId = outletId;
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

    public long getOccupiedTables() {
        return occupiedTables;
    }

    public void setOccupiedTables(long occupiedTables) {
        this.occupiedTables = occupiedTables;
    }

    public long getReservedTables() {
        return reservedTables;
    }

    public void setReservedTables(long reservedTables) {
        this.reservedTables = reservedTables;
    }

    public long getBillingTables() {
        return billingTables;
    }

    public void setBillingTables(long billingTables) {
        this.billingTables = billingTables;
    }
}
