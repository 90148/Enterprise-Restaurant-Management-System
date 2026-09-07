package com.example.restaurant.service;

import com.example.restaurant.dto.inventory.InventoryItemSummaryDto;
import com.example.restaurant.dto.recipe.RecipeDto;
import com.example.restaurant.dto.recipe.RecipeIngredientInput;
import com.example.restaurant.dto.recipe.RecipeItemDto;
import com.example.restaurant.dto.recipe.SaveRecipeRequest;
import com.example.restaurant.entity.*;
import com.example.restaurant.exception.ResourceNotFoundException;
import com.example.restaurant.repository.InventoryItemRepository;
import com.example.restaurant.repository.MenuItemRepository;
import com.example.restaurant.repository.RecipeItemRepository;
import com.example.restaurant.repository.RecipeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final RecipeItemRepository recipeItemRepository;
    private final MenuItemRepository menuItemRepository;
    private final InventoryItemRepository inventoryItemRepository;

    public RecipeService(RecipeRepository recipeRepository,
                         RecipeItemRepository recipeItemRepository,
                         MenuItemRepository menuItemRepository,
                         InventoryItemRepository inventoryItemRepository) {
        this.recipeRepository = recipeRepository;
        this.recipeItemRepository = recipeItemRepository;
        this.menuItemRepository = menuItemRepository;
        this.inventoryItemRepository = inventoryItemRepository;
    }

    @Transactional(readOnly = true)
    public RecipeDto getRecipeByMenuItem(String menuItemId) {
        Recipe recipe = recipeRepository.findByMenuItemId(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe for MenuItem", "menuItemId", menuItemId));
        return mapToDto(recipe);
    }

    @Transactional
    public RecipeDto saveRecipe(SaveRecipeRequest request) {
        MenuItem menuItem = menuItemRepository.findById(request.getMenuItemId())
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", request.getMenuItemId()));

        Recipe recipe = recipeRepository.findByMenuItemId(menuItem.getId())
                .orElseGet(() -> new Recipe(UUID.randomUUID().toString(), menuItem, request.getInstructions()));

        recipe.setInstructions(request.getInstructions());
        recipe.getRecipeItems().clear();

        BigDecimal totalCost = BigDecimal.ZERO;

        if (request.getIngredients() != null) {
            for (RecipeIngredientInput input : request.getIngredients()) {
                InventoryItem invItem = inventoryItemRepository.findById(input.getInventoryItemId())
                        .orElseThrow(() -> new ResourceNotFoundException("InventoryItem", "id", input.getInventoryItemId()));

                RecipeItem rItem = new RecipeItem(
                        UUID.randomUUID().toString(),
                        recipe,
                        invItem,
                        input.getQuantity()
                );
                recipe.getRecipeItems().add(rItem);

                BigDecimal lineCost = invItem.getUnitCost().multiply(input.getQuantity());
                totalCost = totalCost.add(lineCost);
            }
        }

        Recipe savedRecipe = recipeRepository.save(recipe);

        // Update MenuItem costPrice automatically with recipe BOM calculated cost
        menuItem.setCostPrice(totalCost.setScale(2, RoundingMode.HALF_UP));
        menuItemRepository.save(menuItem);

        return mapToDto(savedRecipe);
    }

    @Transactional
    public void deleteRecipe(String menuItemId) {
        Recipe recipe = recipeRepository.findByMenuItemId(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe for MenuItem", "menuItemId", menuItemId));
        recipeRepository.delete(recipe);
    }

    @Transactional(readOnly = true)
    public List<InventoryItemSummaryDto> getAvailableIngredients(String outletId) {
        return inventoryItemRepository.findByOutletIdOrderByNameAsc(outletId).stream()
                .map(item -> new InventoryItemSummaryDto(
                        item.getId(),
                        item.getName(),
                        item.getSku(),
                        item.getUnit().getName(),
                        item.getUnit().getSymbol(),
                        item.getCurrentStock(),
                        item.getUnitCost()
                ))
                .collect(Collectors.toList());
    }

    public RecipeDto mapToDto(Recipe recipe) {
        MenuItem item = recipe.getMenuItem();
        List<RecipeItemDto> itemDtos = new ArrayList<>();
        BigDecimal totalCost = BigDecimal.ZERO;

        for (RecipeItem rItem : recipe.getRecipeItems()) {
            InventoryItem inv = rItem.getInventoryItem();
            BigDecimal lineCost = inv.getUnitCost().multiply(rItem.getQuantity()).setScale(2, RoundingMode.HALF_UP);
            totalCost = totalCost.add(lineCost);

            itemDtos.add(new RecipeItemDto(
                    rItem.getId(),
                    inv.getId(),
                    inv.getName(),
                    inv.getSku(),
                    rItem.getQuantity(),
                    inv.getUnit().getName(),
                    inv.getUnit().getSymbol(),
                    inv.getUnitCost(),
                    lineCost
            ));
        }

        BigDecimal profitMargin = BigDecimal.ZERO;
        if (item.getPrice() != null && item.getPrice().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal diff = item.getPrice().subtract(totalCost);
            profitMargin = diff.divide(item.getPrice(), 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")).setScale(2, RoundingMode.HALF_UP);
        }

        return new RecipeDto(
                recipe.getId(),
                item.getId(),
                item.getName(),
                item.getPrice(),
                recipe.getInstructions(),
                itemDtos,
                totalCost.setScale(2, RoundingMode.HALF_UP),
                profitMargin,
                recipe.getCreatedAt(),
                recipe.getUpdatedAt()
        );
    }
}
