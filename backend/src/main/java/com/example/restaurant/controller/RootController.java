package com.example.restaurant.controller;

import com.example.restaurant.dto.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public ResponseEntity<ApiResponse<Map<String, String>>> rootGreeting() {
        Map<String, String> info = Map.of(
                "status", "UP",
                "service", "RestoMaster Enterprise Restaurant Platform Backend API",
                "swaggerDocs", "/swagger-ui.html",
                "healthCheck", "/api/health"
        );
        return ResponseEntity.ok(ApiResponse.ok("RestoMaster Backend API is live", info));
    }
}
