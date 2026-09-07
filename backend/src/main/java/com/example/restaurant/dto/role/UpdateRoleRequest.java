package com.example.restaurant.dto.role;

import jakarta.validation.constraints.Size;

import java.util.Set;

public class UpdateRoleRequest {

    @Size(max = 255, message = "Description cannot exceed 255 characters")
    private String description;

    private Set<String> permissionIds;

    public UpdateRoleRequest() {
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<String> getPermissionIds() {
        return permissionIds;
    }

    public void setPermissionIds(Set<String> permissionIds) {
        this.permissionIds = permissionIds;
    }
}
