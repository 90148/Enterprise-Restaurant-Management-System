package com.example.restaurant.dto.table;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class TablePositionDto {

    @NotBlank(message = "Table ID is required")
    private String id;

    @NotNull(message = "Position X is required")
    private Integer posX;

    @NotNull(message = "Position Y is required")
    private Integer posY;

    public TablePositionDto() {
    }

    public TablePositionDto(String id, Integer posX, Integer posY) {
        this.id = id;
        this.posX = posX;
        this.posY = posY;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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
