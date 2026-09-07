package com.example.restaurant.controller;

import com.example.restaurant.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/rbac")
@Tag(name = "RBAC Test", description = "Role-based access control verification endpoints")
public class RbacTestController {

    @GetMapping("/admin-only")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Endpoint restricted to ADMIN role only")
    public ResponseEntity<ApiResponse<Map<String, String>>> adminOnly() {
        return ResponseEntity.ok(ApiResponse.ok("Access granted: Admin role verified", Map.of("role", "ADMIN")));
    }

    @GetMapping("/user-view")
    @PreAuthorize("hasAuthority('USER_VIEW')")
    @Operation(summary = "Endpoint restricted to users with USER_VIEW authority")
    public ResponseEntity<ApiResponse<Map<String, String>>> userView() {
        return ResponseEntity.ok(ApiResponse.ok("Access granted: USER_VIEW permission verified", Map.of("permission", "USER_VIEW")));
    }

    @GetMapping("/kitchen-view")
    @PreAuthorize("hasAuthority('KITCHEN_VIEW')")
    @Operation(summary = "Endpoint restricted to users with KITCHEN_VIEW authority")
    public ResponseEntity<ApiResponse<Map<String, String>>> kitchenView() {
        return ResponseEntity.ok(ApiResponse.ok("Access granted: KITCHEN_VIEW permission verified", Map.of("permission", "KITCHEN_VIEW")));
    }

    @GetMapping("/settings-update")
    @PreAuthorize("hasAuthority('SETTINGS_UPDATE')")
    @Operation(summary = "Endpoint restricted to users with SETTINGS_UPDATE authority")
    public ResponseEntity<ApiResponse<Map<String, String>>> settingsUpdate() {
        return ResponseEntity.ok(ApiResponse.ok("Access granted: SETTINGS_UPDATE permission verified", Map.of("permission", "SETTINGS_UPDATE")));
    }
}
