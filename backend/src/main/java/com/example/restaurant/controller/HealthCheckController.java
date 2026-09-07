package com.example.restaurant.controller;

import com.example.restaurant.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/health")
@Tag(name = "Health", description = "System health check endpoints")
public class HealthCheckController {

    @GetMapping
    @Operation(summary = "Check backend service health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> healthCheck() {
        Map<String, Object> status = Map.of(
                "status", "UP",
                "service", "restaurant-backend",
                "version", "1.0.0",
                "phase", "Phase 1 - Architecture & Scaffolding"
        );
        return ResponseEntity.ok(ApiResponse.ok("Service is running smoothly", status));
    }
}
