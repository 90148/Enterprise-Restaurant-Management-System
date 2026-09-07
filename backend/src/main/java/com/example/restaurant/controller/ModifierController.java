package com.example.restaurant.controller;

import com.example.restaurant.dto.menu.CreateModifierGroupRequest;
import com.example.restaurant.dto.menu.ModifierGroupDto;
import com.example.restaurant.dto.response.ApiResponse;
import com.example.restaurant.service.ModifierService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu/modifiers")
public class ModifierController {

    private final ModifierService modifierService;

    public ModifierController(ModifierService modifierService) {
        this.modifierService = modifierService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('MENU_VIEW')")
    public ResponseEntity<ApiResponse<List<ModifierGroupDto>>> getModifierGroups(@RequestParam String outletId) {
        List<ModifierGroupDto> list = modifierService.getModifierGroupsByOutlet(outletId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('MENU_VIEW')")
    public ResponseEntity<ApiResponse<ModifierGroupDto>> getModifierGroupById(@PathVariable String id) {
        ModifierGroupDto dto = modifierService.getModifierGroupById(id);
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('MENU_CREATE', 'MENU_UPDATE')")
    public ResponseEntity<ApiResponse<ModifierGroupDto>> createModifierGroup(@Valid @RequestBody CreateModifierGroupRequest request) {
        ModifierGroupDto created = modifierService.createModifierGroup(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Modifier group created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MENU_UPDATE')")
    public ResponseEntity<ApiResponse<ModifierGroupDto>> updateModifierGroup(
            @PathVariable String id,
            @Valid @RequestBody CreateModifierGroupRequest request) {
        ModifierGroupDto updated = modifierService.updateModifierGroup(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Modifier group updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MENU_DELETE')")
    public ResponseEntity<ApiResponse<Void>> deleteModifierGroup(@PathVariable String id) {
        modifierService.deleteModifierGroup(id);
        return ResponseEntity.ok(ApiResponse.ok("Modifier group deleted successfully", null));
    }
}
