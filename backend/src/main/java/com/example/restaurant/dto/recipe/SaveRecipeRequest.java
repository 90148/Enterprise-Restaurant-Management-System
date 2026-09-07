package com.example.restaurant.dto.recipe;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

public class SaveRecipeRequest {

    @NotBlank(message = "Menu item ID is required")
    private String menuItemId;

    private String instructions;

    @Valid
    private List<RecipeIngredientInput> ingredients = new ArrayList<>();

    public SaveRecipeRequest() {
    }

    public SaveRecipeRequest(String menuItemId, String instructions, List<RecipeIngredientInput> ingredients) {
        this.menuItemId = menuItemId;
        this.instructions = instructions;
        this.ingredients = ingredients != null ? ingredients : new ArrayList<>();
    }

    public String getMenuItemId() {
        return menuItemId;
    }

    public void setMenuItemId(String menuItemId) {
        this.menuItemId = menuItemId;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public List<RecipeIngredientInput> getIngredients() {
        return ingredients;
    }

    public void setIngredients(List<RecipeIngredientInput> ingredients) {
        this.ingredients = ingredients;
    }
}
