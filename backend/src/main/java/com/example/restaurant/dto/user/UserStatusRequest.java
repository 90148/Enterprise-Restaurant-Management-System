package com.example.restaurant.dto.user;

import jakarta.validation.constraints.NotNull;

public class UserStatusRequest {

    @NotNull(message = "Active status is required")
    private Boolean active;

    public UserStatusRequest() {
    }

    public UserStatusRequest(Boolean active) {
        this.active = active;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
