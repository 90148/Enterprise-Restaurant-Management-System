package com.example.restaurant.dto.menu;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateCategoryRequest {

    @NotBlank(message = "Category name is required")
    @Size(min = 2, max = 100, message = "Category name must be between 2 and 100 characters")
    private String name;

    private String description;

    private Integer displayOrder;

    private Boolean active;

    private String kitchenStation;

    public UpdateCategoryRequest() {
    }

    public UpdateCategoryRequest(String name, String description, Integer displayOrder, Boolean active) {
        this.name = name;
        this.description = description;
        this.displayOrder = displayOrder;
        this.active = active;
    }

    public UpdateCategoryRequest(String name, String description, Integer displayOrder, Boolean active, String kitchenStation) {
        this.name = name;
        this.description = description;
        this.displayOrder = displayOrder;
        this.active = active;
        this.kitchenStation = kitchenStation;
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

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public String getKitchenStation() {
        return kitchenStation;
    }

    public void setKitchenStation(String kitchenStation) {
        this.kitchenStation = kitchenStation;
    }
}
