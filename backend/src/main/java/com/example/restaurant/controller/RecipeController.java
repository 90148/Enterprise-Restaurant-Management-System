package com.example.restaurant.controller;

import com.example.restaurant.dto.inventory.InventoryItemSummaryDto;
import com.example.restaurant.dto.recipe.RecipeDto;
import com.example.restaurant.dto.recipe.SaveRecipeRequest;
import com.example.restaurant.dto.response.ApiResponse;
import com.example.restaurant.service.RecipeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu/recipes")
public class RecipeController {

    private final RecipeService recipeService;

    public RecipeController(RecipeService recipeService) {
        this.recipeService = recipeService;
    }

    @GetMapping("/item/{menuItemId}")
    @PreAuthorize("hasAuthority('MENU_VIEW')")
    public ResponseEntity<ApiResponse<RecipeDto>> getRecipeByMenuItem(@PathVariable String menuItemId) {
        RecipeDto recipe = recipeService.getRecipeByMenuItem(menuItemId);
        return ResponseEntity.ok(ApiResponse.ok(recipe));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('MENU_CREATE', 'MENU_UPDATE')")
    public ResponseEntity<ApiResponse<RecipeDto>> saveRecipe(@Valid @RequestBody SaveRecipeRequest request) {
        RecipeDto saved = recipeService.saveRecipe(request);
        return ResponseEntity.ok(ApiResponse.ok("Recipe and Bill of Materials saved successfully", saved));
    }

    @DeleteMapping("/item/{menuItemId}")
    @PreAuthorize("hasAuthority('MENU_DELETE')")
    public ResponseEntity<ApiResponse<Void>> deleteRecipe(@PathVariable String menuItemId) {
        recipeService.deleteRecipe(menuItemId);
        return ResponseEntity.ok(ApiResponse.ok("Recipe deleted successfully", null));
    }

    @GetMapping("/ingredients")
    @PreAuthorize("hasAuthority('MENU_VIEW')")
    public ResponseEntity<ApiResponse<List<InventoryItemSummaryDto>>> getAvailableIngredients(@RequestParam String outletId) {
        List<InventoryItemSummaryDto> ingredients = recipeService.getAvailableIngredients(outletId);
        return ResponseEntity.ok(ApiResponse.ok(ingredients));
    }
}
