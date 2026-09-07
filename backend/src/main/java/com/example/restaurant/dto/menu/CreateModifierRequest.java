package com.example.restaurant.dto.menu;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class CreateModifierRequest {

    @NotBlank(message = "Modifier name is required")
    private String name;

    @NotNull(message = "Price is required")
    private BigDecimal price = BigDecimal.ZERO;

    private Boolean active = true;

    public CreateModifierRequest() {
    }

    public CreateModifierRequest(String name, BigDecimal price, Boolean active) {
        this.name = name;
        this.price = price != null ? price : BigDecimal.ZERO;
        this.active = active != null ? active : true;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
