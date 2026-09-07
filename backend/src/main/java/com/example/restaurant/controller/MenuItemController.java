package com.example.restaurant.controller;

import com.example.restaurant.dto.menu.CreateMenuItemRequest;
import com.example.restaurant.dto.menu.MenuItemAvailabilityRequest;
import com.example.restaurant.dto.menu.MenuItemDto;
import com.example.restaurant.dto.menu.UpdateMenuItemRequest;
import com.example.restaurant.dto.response.ApiResponse;
import com.example.restaurant.dto.response.PagedResponse;
import com.example.restaurant.service.MenuItemService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/menu/items")
public class MenuItemController {

    private final MenuItemService menuItemService;

    public MenuItemController(MenuItemService menuItemService) {
        this.menuItemService = menuItemService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('MENU_VIEW')")
    public ResponseEntity<ApiResponse<PagedResponse<MenuItemDto>>> getMenuItems(
            @RequestParam(required = false) String outletId,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) Boolean available,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sort,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort sortOrder = direction.equalsIgnoreCase("desc") ?
                Sort.by(sort).descending() : Sort.by(sort).ascending();
        Pageable pageable = PageRequest.of(page, size, sortOrder);

        Page<MenuItemDto> items = menuItemService.getMenuItems(outletId, categoryId, available, active, search, pageable);
        return ResponseEntity.ok(ApiResponse.ok(PagedResponse.from(items)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('MENU_VIEW')")
    public ResponseEntity<ApiResponse<MenuItemDto>> getMenuItemById(@PathVariable String id) {
        MenuItemDto item = menuItemService.getMenuItemById(id);
        return ResponseEntity.ok(ApiResponse.ok(item));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('MENU_CREATE', 'MENU_UPDATE')")
    public ResponseEntity<ApiResponse<MenuItemDto>> createMenuItem(@Valid @RequestBody CreateMenuItemRequest request) {
        MenuItemDto created = menuItemService.createMenuItem(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Menu item created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MENU_UPDATE')")
    public ResponseEntity<ApiResponse<MenuItemDto>> updateMenuItem(
            @PathVariable String id,
            @Valid @RequestBody UpdateMenuItemRequest request) {
        MenuItemDto updated = menuItemService.updateMenuItem(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Menu item updated successfully", updated));
    }

    @PatchMapping("/{id}/availability")
    @PreAuthorize("hasAnyAuthority('MENU_UPDATE', 'KITCHEN_UPDATE', 'ORDER_UPDATE')")
    public ResponseEntity<ApiResponse<MenuItemDto>> updateAvailability(
            @PathVariable String id,
            @Valid @RequestBody MenuItemAvailabilityRequest request) {
        MenuItemDto updated = menuItemService.updateAvailability(id, request.getIsAvailable());
        return ResponseEntity.ok(ApiResponse.ok("Item availability updated", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MENU_DELETE')")
    public ResponseEntity<ApiResponse<Void>> deleteMenuItem(@PathVariable String id) {
        menuItemService.deleteMenuItem(id);
        return ResponseEntity.ok(ApiResponse.ok("Menu item deleted successfully", null));
    }
}
