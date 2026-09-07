package com.example.restaurant.controller;

import com.example.restaurant.dto.floor.CreateFloorRequest;
import com.example.restaurant.dto.floor.FloorDto;
import com.example.restaurant.dto.floor.UpdateFloorRequest;
import com.example.restaurant.dto.response.ApiResponse;
import com.example.restaurant.service.FloorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/floors")
public class FloorController {

    private final FloorService floorService;

    public FloorController(FloorService floorService) {
        this.floorService = floorService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('OUTLET_VIEW')")
    public ResponseEntity<ApiResponse<List<FloorDto>>> getFloors(
            @RequestParam String outletId,
            @RequestParam(required = false) Boolean activeOnly) {
        List<FloorDto> floors = floorService.getFloorsByOutlet(outletId, activeOnly);
        return ResponseEntity.ok(ApiResponse.ok(floors));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('OUTLET_VIEW')")
    public ResponseEntity<ApiResponse<FloorDto>> getFloorById(@PathVariable String id) {
        FloorDto floor = floorService.getFloorById(id);
        return ResponseEntity.ok(ApiResponse.ok(floor));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('OUTLET_CREATE', 'OUTLET_UPDATE')")
    public ResponseEntity<ApiResponse<FloorDto>> createFloor(@Valid @RequestBody CreateFloorRequest request) {
        FloorDto created = floorService.createFloor(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Floor created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('OUTLET_UPDATE')")
    public ResponseEntity<ApiResponse<FloorDto>> updateFloor(
            @PathVariable String id,
            @Valid @RequestBody UpdateFloorRequest request) {
        FloorDto updated = floorService.updateFloor(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Floor updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('OUTLET_UPDATE')")
    public ResponseEntity<ApiResponse<Void>> deleteFloor(@PathVariable String id) {
        floorService.deleteFloor(id);
        return ResponseEntity.ok(ApiResponse.ok("Floor deleted successfully", null));
    }
}
