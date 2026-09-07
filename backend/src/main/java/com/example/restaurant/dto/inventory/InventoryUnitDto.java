package com.example.restaurant.dto.inventory;

public class InventoryUnitDto {

    private String id;
    private String name;
    private String symbol;

    public InventoryUnitDto() {
    }

    public InventoryUnitDto(String id, String name, String symbol) {
        this.id = id;
        this.name = name;
        this.symbol = symbol;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }
}
