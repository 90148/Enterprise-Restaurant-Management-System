package com.example.restaurant.dto.floor;

import java.time.LocalDateTime;

public class FloorDto {

    private String id;
    private String outletId;
    private String outletName;
    private String name;
    private Integer floorNumber;
    private boolean active;
    private long tableCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public FloorDto() {
    }

    public FloorDto(String id, String outletId, String outletName, String name, Integer floorNumber, boolean active, long tableCount, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.outletId = outletId;
        this.outletName = outletName;
        this.name = name;
        this.floorNumber = floorNumber;
        this.active = active;
        this.tableCount = tableCount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOutletId() {
        return outletId;
    }

    public void setOutletId(String outletId) {
        this.outletId = outletId;
    }

    public String getOutletName() {
        return outletName;
    }

    public void setOutletName(String outletName) {
        this.outletName = outletName;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getFloorNumber() {
        return floorNumber;
    }

    public void setFloorNumber(Integer floorNumber) {
        this.floorNumber = floorNumber;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public long getTableCount() {
        return tableCount;
    }

    public void setTableCount(long tableCount) {
        this.tableCount = tableCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
