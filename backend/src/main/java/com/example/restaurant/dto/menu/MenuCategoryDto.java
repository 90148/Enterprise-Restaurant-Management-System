package com.example.restaurant.dto.menu;

import java.time.LocalDateTime;

public class MenuCategoryDto {

    private String id;
    private String outletId;
    private String name;
    private String description;
    private Integer displayOrder;
    private boolean active;
    private long itemCount;
    private String kitchenStation;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public MenuCategoryDto() {
    }

    public MenuCategoryDto(String id, String outletId, String name, String description, Integer displayOrder, boolean active, long itemCount, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this(id, outletId, name, description, displayOrder, active, itemCount, "MAIN_KITCHEN", createdAt, updatedAt);
    }

    public MenuCategoryDto(String id, String outletId, String name, String description, Integer displayOrder, boolean active, long itemCount, String kitchenStation, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.outletId = outletId;
        this.name = name;
        this.description = description;
        this.displayOrder = displayOrder;
        this.active = active;
        this.itemCount = itemCount;
        this.kitchenStation = kitchenStation;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public long getItemCount() {
        return itemCount;
    }

    public void setItemCount(long itemCount) {
        this.itemCount = itemCount;
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

    public String getKitchenStation() {
        return kitchenStation;
    }

    public void setKitchenStation(String kitchenStation) {
        this.kitchenStation = kitchenStation;
    }
}
