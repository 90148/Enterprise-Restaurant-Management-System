package com.example.restaurant.dto.order;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class ApplyDiscountRequest {

    @NotBlank(message = "Discount type is required (PERCENTAGE or FIXED)")
    private String discountType;

    @NotNull(message = "Discount value is required")
    @DecimalMin(value = "0.00", message = "Discount value must be non-negative")
    private BigDecimal discountValue;

    private String reason;

    public ApplyDiscountRequest() {
    }

    public ApplyDiscountRequest(String discountType, BigDecimal discountValue, String reason) {
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.reason = reason;
    }

    public String getDiscountType() {
        return discountType;
    }

    public void setDiscountType(String discountType) {
        this.discountType = discountType;
    }

    public BigDecimal getDiscountValue() {
        return discountValue;
    }

    public void setDiscountValue(BigDecimal discountValue) {
        this.discountValue = discountValue;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
