package com.example.restaurant.dto.kot;

import com.example.restaurant.entity.KotStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateKotStatusRequest {

    @NotNull(message = "Status is required")
    private KotStatus status;

    private String reason;

    public UpdateKotStatusRequest() {
    }

    public UpdateKotStatusRequest(KotStatus status, String reason) {
        this.status = status;
        this.reason = reason;
    }

    public KotStatus getStatus() {
        return status;
    }

    public void setStatus(KotStatus status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
