package com.example.restaurant.dto.menu;

import java.util.ArrayList;
import java.util.List;

public class ModifierGroupDto {

    private String id;
    private String outletId;
    private String name;
    private Integer minSelection;
    private Integer maxSelection;
    private boolean active;
    private List<ModifierDto> modifiers = new ArrayList<>();

    public ModifierGroupDto() {
    }

    public ModifierGroupDto(String id, String outletId, String name, Integer minSelection, Integer maxSelection, boolean active, List<ModifierDto> modifiers) {
        this.id = id;
        this.outletId = outletId;
        this.name = name;
        this.minSelection = minSelection;
        this.maxSelection = maxSelection;
        this.active = active;
        this.modifiers = modifiers != null ? modifiers : new ArrayList<>();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public List<ModifierDto> getModifiers() {
        return modifiers;
    }

    public void setModifiers(List<ModifierDto> modifiers) {
        this.modifiers = modifiers;
    }
}
