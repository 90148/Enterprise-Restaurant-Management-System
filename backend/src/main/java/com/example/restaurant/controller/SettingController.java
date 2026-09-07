package com.example.restaurant.controller;

import com.example.restaurant.dto.response.ApiResponse;
import com.example.restaurant.dto.setting.OutletSettingsDto;
import com.example.restaurant.dto.setting.TaxDto;
import com.example.restaurant.entity.Outlet;
import com.example.restaurant.repository.OutletRepository;
import com.example.restaurant.service.SettingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Settings & Tax Management", description = "Endpoints for restaurant preferences and tax configuration")
public class SettingController {

    private final SettingService settingService;
    private final OutletRepository outletRepository;

    public SettingController(SettingService settingService, OutletRepository outletRepository) {
        this.settingService = settingService;
        this.outletRepository = outletRepository;
    }

    private String resolveOutletId(String outletId) {
        if (outletId != null && !outletId.isBlank()) {
            return outletId;
        }
        return outletRepository.findAll().stream()
                .findFirst()
                .map(Outlet::getId)
                .orElse("default");
    }

    @GetMapping("/settings")
    @PreAuthorize("hasAnyAuthority('SETTINGS_VIEW', 'ROLE_ADMIN') or hasRole('ADMIN')")
    @Operation(summary = "Get configuration preferences for outlet")
    public ResponseEntity<ApiResponse<OutletSettingsDto>> getSettings(
            @RequestParam(required = false) String outletId) {
        String effectiveOutletId = resolveOutletId(outletId);
        OutletSettingsDto settings = settingService.getOutletSettings(effectiveOutletId);
        return ResponseEntity.ok(ApiResponse.ok(settings));
    }

    @PostMapping("/settings")
    @PreAuthorize("hasAnyAuthority('SETTINGS_UPDATE', 'ROLE_ADMIN') or hasRole('ADMIN')")
    @Operation(summary = "Update outlet configuration preferences")
    public ResponseEntity<ApiResponse<OutletSettingsDto>> updateSettings(
            @RequestParam(required = false) String outletId,
            @RequestBody OutletSettingsDto request) {
        String effectiveOutletId = resolveOutletId(outletId);
        OutletSettingsDto updated = settingService.updateOutletSettings(effectiveOutletId, request);
        return ResponseEntity.ok(ApiResponse.ok("Settings updated successfully", updated));
    }

    @GetMapping("/taxes")
    @PreAuthorize("hasAnyAuthority('SETTINGS_VIEW', 'BILL_VIEW', 'ORDER_CREATE', 'ROLE_ADMIN') or hasRole('ADMIN')")
    @Operation(summary = "Get all configured taxes for outlet")
    public ResponseEntity<ApiResponse<List<TaxDto>>> getTaxes(
            @RequestParam(required = false) String outletId) {
        String effectiveOutletId = resolveOutletId(outletId);
        List<TaxDto> taxes = settingService.getTaxes(effectiveOutletId);
        return ResponseEntity.ok(ApiResponse.ok(taxes));
    }

    @PostMapping("/taxes")
    @PreAuthorize("hasAnyAuthority('SETTINGS_UPDATE', 'ROLE_ADMIN') or hasRole('ADMIN')")
    @Operation(summary = "Create a new tax rate")
    public ResponseEntity<ApiResponse<TaxDto>> createTax(
            @Valid @RequestBody TaxDto request) {
        if (request.getOutletId() == null || request.getOutletId().isBlank()) {
            request.setOutletId(resolveOutletId(null));
        }
        TaxDto created = settingService.createTax(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tax created successfully", created));
    }

    @PutMapping("/taxes/{id}")
    @PreAuthorize("hasAnyAuthority('SETTINGS_UPDATE', 'ROLE_ADMIN') or hasRole('ADMIN')")
    @Operation(summary = "Update an existing tax rate")
    public ResponseEntity<ApiResponse<TaxDto>> updateTax(
            @PathVariable String id,
            @Valid @RequestBody TaxDto request) {
        TaxDto updated = settingService.updateTax(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Tax updated successfully", updated));
    }

    @DeleteMapping("/taxes/{id}")
    @PreAuthorize("hasAnyAuthority('SETTINGS_UPDATE', 'ROLE_ADMIN') or hasRole('ADMIN')")
    @Operation(summary = "Delete a tax rate")
    public ResponseEntity<ApiResponse<Void>> deleteTax(@PathVariable String id) {
        settingService.deleteTax(id);
        return ResponseEntity.ok(ApiResponse.ok("Tax deleted successfully", null));
    }
}
