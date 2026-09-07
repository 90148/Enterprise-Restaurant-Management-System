package com.example.restaurant.controller;

import com.example.restaurant.dto.menu.CreateCategoryRequest;
import com.example.restaurant.dto.menu.MenuCategoryDto;
import com.example.restaurant.dto.menu.UpdateCategoryRequest;
import com.example.restaurant.dto.response.ApiResponse;
import com.example.restaurant.service.MenuCategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu/categories")
public class MenuCategoryController {

    private final MenuCategoryService categoryService;

    public MenuCategoryController(MenuCategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('MENU_VIEW')")
    public ResponseEntity<ApiResponse<List<MenuCategoryDto>>> getCategories(
            @RequestParam String outletId,
            @RequestParam(required = false) Boolean activeOnly) {
        List<MenuCategoryDto> list = categoryService.getCategoriesByOutlet(outletId, activeOnly);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('MENU_VIEW')")
    public ResponseEntity<ApiResponse<MenuCategoryDto>> getCategoryById(@PathVariable String id) {
        MenuCategoryDto cat = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.ok(cat));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('MENU_CREATE', 'MENU_UPDATE')")
    public ResponseEntity<ApiResponse<MenuCategoryDto>> createCategory(@Valid @RequestBody CreateCategoryRequest request) {
        MenuCategoryDto created = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Category created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MENU_UPDATE')")
    public ResponseEntity<ApiResponse<MenuCategoryDto>> updateCategory(
            @PathVariable String id,
            @Valid @RequestBody UpdateCategoryRequest request) {
        MenuCategoryDto updated = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Category updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MENU_DELETE')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable String id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.ok("Category deleted successfully", null));
    }
}
