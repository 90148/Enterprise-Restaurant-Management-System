package com.example.restaurant.dto.table;

import com.example.restaurant.entity.TableShape;
import com.example.restaurant.entity.TableStatus;

import java.time.LocalDateTime;

public class TableDto {

    private String id;
    private String floorId;
    private String floorName;
    private Integer floorNumber;
    private String outletId;
    private String tableNumber;
    private Integer capacity;
    private TableStatus status;
    private TableShape shape;
    private Integer posX;
    private Integer posY;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TableDto() {
    }

    public TableDto(String id, String floorId, String floorName, Integer floorNumber, String outletId,
                    String tableNumber, Integer capacity, TableStatus status, TableShape shape,
                    Integer posX, Integer posY, boolean active, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.floorId = floorId;
        this.floorName = floorName;
        this.floorNumber = floorNumber;
        this.outletId = outletId;
        this.tableNumber = tableNumber;
        this.capacity = capacity;
        this.status = status;
        this.shape = shape;
        this.posX = posX;
        this.posY = posY;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFloorId() {
        return floorId;
    }

    public void setFloorId(String floorId) {
        this.floorId = floorId;
    }

    public String getFloorName() {
        return floorName;
    }

    public void setFloorName(String floorName) {
        this.floorName = floorName;
    }

    public Integer getFloorNumber() {
        return floorNumber;
    }

    public void setFloorNumber(Integer floorNumber) {
        this.floorNumber = floorNumber;
    }

    public String getOutletId() {
        return outletId;
    }

    public void setOutletId(String outletId) {
        this.outletId = outletId;
    }

    public String getTableNumber() {
        return tableNumber;
    }

    public void setTableNumber(String tableNumber) {
        this.tableNumber = tableNumber;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public TableStatus getStatus() {
        return status;
    }

    public void setStatus(TableStatus status) {
        this.status = status;
    }

    public TableShape getShape() {
        return shape;
    }

    public void setShape(TableShape shape) {
        this.shape = shape;
    }

    public Integer getPosX() {
        return posX;
    }

    public void setPosX(Integer posX) {
        this.posX = posX;
    }

    public Integer getPosY() {
        return posY;
    }

    public void setPosY(Integer posY) {
        this.posY = posY;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
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
