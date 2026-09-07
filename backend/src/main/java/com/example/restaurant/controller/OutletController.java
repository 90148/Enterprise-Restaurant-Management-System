package com.example.restaurant.controller;

import com.example.restaurant.dto.outlet.CreateOutletRequest;
import com.example.restaurant.dto.outlet.OutletDto;
import com.example.restaurant.dto.outlet.UpdateOutletRequest;
import com.example.restaurant.dto.response.ApiResponse;
import com.example.restaurant.dto.response.PagedResponse;
import com.example.restaurant.dto.user.UserStatusRequest;
import com.example.restaurant.service.OutletService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/outlets")
@Tag(name = "Outlet Management", description = "Multi-outlet management and configurations")
public class OutletController {

    private final OutletService outletService;

    public OutletController(OutletService outletService) {
        this.outletService = outletService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('OUTLET_VIEW')")
    @Operation(summary = "Get paginated outlets list")
    public ResponseEntity<ApiResponse<PagedResponse<OutletDto>>> getOutlets(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {

        String[] sortParts = sort.split(",");
        Sort.Direction direction = sortParts.length > 1 && "asc".equalsIgnoreCase(sortParts[1])
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortParts[0]));

        Page<OutletDto> outletPage = outletService.getOutlets(search, active, pageRequest);
        return ResponseEntity.ok(ApiResponse.ok(PagedResponse.from(outletPage)));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAuthority('OUTLET_VIEW')")
    @Operation(summary = "Get all active outlets for dropdown selector")
    public ResponseEntity<ApiResponse<List<OutletDto>>> getActiveOutlets() {
        return ResponseEntity.ok(ApiResponse.ok(outletService.getAllActiveOutlets()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('OUTLET_VIEW')")
    @Operation(summary = "Get outlet details by ID")
    public ResponseEntity<ApiResponse<OutletDto>> getOutletById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(outletService.getOutletById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('OUTLET_CREATE')")
    @Operation(summary = "Create a new restaurant outlet")
    public ResponseEntity<ApiResponse<OutletDto>> createOutlet(@Valid @RequestBody CreateOutletRequest request) {
        OutletDto created = outletService.createOutlet(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Outlet created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('OUTLET_UPDATE')")
    @Operation(summary = "Update outlet details")
    public ResponseEntity<ApiResponse<OutletDto>> updateOutlet(
            @PathVariable String id,
            @Valid @RequestBody UpdateOutletRequest request) {
        OutletDto updated = outletService.updateOutlet(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Outlet updated successfully", updated));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('OUTLET_UPDATE')")
    @Operation(summary = "Activate or deactivate outlet")
    public ResponseEntity<ApiResponse<OutletDto>> updateOutletStatus(
            @PathVariable String id,
            @Valid @RequestBody UserStatusRequest request) {
        OutletDto updated = outletService.updateOutletStatus(id, request.getActive());
        String statusText = request.getActive() ? "activated" : "deactivated";
        return ResponseEntity.ok(ApiResponse.ok("Outlet " + statusText + " successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('OUTLET_UPDATE')")
    @Operation(summary = "Delete outlet")
    public ResponseEntity<ApiResponse<Void>> deleteOutlet(@PathVariable String id) {
        outletService.deleteOutlet(id);
        return ResponseEntity.ok(ApiResponse.ok("Outlet deleted successfully", null));
    }
}
