package com.example.restaurant.dto.table;

import com.example.restaurant.entity.TableShape;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateTableRequest {

    @NotBlank(message = "Floor ID is required")
    private String floorId;

    @NotBlank(message = "Table number is required")
    @Size(min = 1, max = 20, message = "Table number must be between 1 and 20 characters")
    private String tableNumber;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1 person")
    @Max(value = 50, message = "Capacity cannot exceed 50 people")
    private Integer capacity = 4;

    private TableShape shape = TableShape.SQUARE;

    private Integer posX = 0;

    private Integer posY = 0;

    public CreateTableRequest() {
    }

    public CreateTableRequest(String floorId, String tableNumber, Integer capacity, TableShape shape, Integer posX, Integer posY) {
        this.floorId = floorId;
        this.tableNumber = tableNumber;
        this.capacity = capacity != null ? capacity : 4;
        this.shape = shape != null ? shape : TableShape.SQUARE;
        this.posX = posX != null ? posX : 0;
        this.posY = posY != null ? posY : 0;
    }

    public String getFloorId() {
        return floorId;
    }

    public void setFloorId(String floorId) {
        this.floorId = floorId;
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
}
