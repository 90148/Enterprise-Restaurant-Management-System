package com.example.restaurant.dto.floor;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateFloorRequest {

    @NotBlank(message = "Outlet ID is required")
    private String outletId;

    @NotBlank(message = "Floor name is required")
    @Size(min = 2, max = 50, message = "Floor name must be between 2 and 50 characters")
    private String name;

    @NotNull(message = "Floor number is required")
    @Min(value = 1, message = "Floor number must be at least 1")
    private Integer floorNumber = 1;

    private Boolean active = true;

    public CreateFloorRequest() {
    }

    public CreateFloorRequest(String outletId, String name, Integer floorNumber, Boolean active) {
        this.outletId = outletId;
        this.name = name;
        this.floorNumber = floorNumber;
        this.active = active != null ? active : true;
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

    public Integer getFloorNumber() {
        return floorNumber;
    }

    public void setFloorNumber(Integer floorNumber) {
        this.floorNumber = floorNumber;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
