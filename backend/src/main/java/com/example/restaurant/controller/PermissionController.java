package com.example.restaurant.controller;

import com.example.restaurant.dto.response.ApiResponse;
import com.example.restaurant.dto.role.PermissionDto;
import com.example.restaurant.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/permissions")
@Tag(name = "Permission Management", description = "System permissions and category groupings")
public class PermissionController {

    private final RoleService roleService;

    public PermissionController(RoleService roleService) {
        this.roleService = roleService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_VIEW')")
    @Operation(summary = "Get all permissions list")
    public ResponseEntity<ApiResponse<List<PermissionDto>>> getAllPermissions() {
        return ResponseEntity.ok(ApiResponse.ok(roleService.getAllPermissions()));
    }

    @GetMapping("/grouped")
    @PreAuthorize("hasAuthority('ROLE_VIEW')")
    @Operation(summary = "Get all permissions grouped by domain category")
    public ResponseEntity<ApiResponse<Map<String, List<PermissionDto>>>> getGroupedPermissions() {
        return ResponseEntity.ok(ApiResponse.ok(roleService.getAllPermissionsGrouped()));
    }
}
