package com.example.restaurant.dto.menu;

import jakarta.validation.constraints.NotNull;

public class MenuItemAvailabilityRequest {

    @NotNull(message = "Availability status is required")
    private Boolean isAvailable;

    public MenuItemAvailabilityRequest() {
    }

    public MenuItemAvailabilityRequest(Boolean isAvailable) {
        this.isAvailable = isAvailable;
    }

    public Boolean getIsAvailable() {
        return isAvailable;
    }

    public void setIsAvailable(Boolean isAvailable) {
        this.isAvailable = isAvailable;
    }
}
