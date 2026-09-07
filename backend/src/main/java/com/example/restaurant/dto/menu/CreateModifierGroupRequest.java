package com.example.restaurant.dto.menu;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

public class CreateModifierGroupRequest {

    private String outletId;

    @NotBlank(message = "Modifier group name is required")
    private String name;

    @NotNull(message = "Min selection is required")
    @Min(value = 0, message = "Min selection cannot be negative")
    private Integer minSelection = 0;

    @NotNull(message = "Max selection is required")
    @Min(value = 1, message = "Max selection must be at least 1")
    private Integer maxSelection = 1;

    private Boolean active = true;

    private List<CreateModifierRequest> modifiers = new ArrayList<>();

    public CreateModifierGroupRequest() {
    }

    public CreateModifierGroupRequest(String outletId, String name, Integer minSelection, Integer maxSelection, Boolean active, List<CreateModifierRequest> modifiers) {
        this.outletId = outletId;
        this.name = name;
        this.minSelection = minSelection != null ? minSelection : 0;
        this.maxSelection = maxSelection != null ? maxSelection : 1;
        this.active = active != null ? active : true;
        this.modifiers = modifiers != null ? modifiers : new ArrayList<>();
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

    public Integer getMinSelection() {
        return minSelection;
    }

    public void setMinSelection(Integer minSelection) {
        this.minSelection = minSelection;
    }

    public Integer getMaxSelection() {
        return maxSelection;
    }

    public void setMaxSelection(Integer maxSelection) {
        this.maxSelection = maxSelection;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public List<CreateModifierRequest> getModifiers() {
        return modifiers;
    }

    public void setModifiers(List<CreateModifierRequest> modifiers) {
        this.modifiers = modifiers;
    }
}
