package com.example.restaurant.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "modifier_groups")
public class ModifierGroup {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "outlet_id")
    private Outlet outlet;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "min_selection", nullable = false)
    private Integer minSelection = 0;

    @Column(name = "max_selection", nullable = false)
    private Integer maxSelection = 1;

    @Column(nullable = false)
    private boolean active = true;

    @OneToMany(mappedBy = "modifierGroup", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Modifier> modifiers = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public ModifierGroup() {
    }

    public ModifierGroup(String id, Outlet outlet, String name, Integer minSelection, Integer maxSelection) {
        this.id = id;
        this.outlet = outlet;
        this.name = name;
        this.minSelection = minSelection != null ? minSelection : 0;
        this.maxSelection = maxSelection != null ? maxSelection : 1;
        this.active = true;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Outlet getOutlet() {
        return outlet;
    }

    public void setOutlet(Outlet outlet) {
        this.outlet = outlet;
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

    public List<Modifier> getModifiers() {
        return modifiers;
    }

    public void setModifiers(List<Modifier> modifiers) {
        this.modifiers = modifiers;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
