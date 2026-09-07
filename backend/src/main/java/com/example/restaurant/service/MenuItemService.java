package com.example.restaurant.service;

import com.example.restaurant.dto.menu.*;
import com.example.restaurant.entity.MenuCategory;
import com.example.restaurant.entity.MenuItem;
import com.example.restaurant.entity.ModifierGroup;
import com.example.restaurant.exception.BusinessException;
import com.example.restaurant.exception.ResourceNotFoundException;
import com.example.restaurant.repository.MenuCategoryRepository;
import com.example.restaurant.repository.MenuItemRepository;
import com.example.restaurant.repository.ModifierGroupRepository;
import com.example.restaurant.repository.RecipeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final MenuCategoryRepository categoryRepository;
    private final ModifierGroupRepository modifierGroupRepository;
    private final RecipeRepository recipeRepository;
    private final ModifierService modifierService;

    public MenuItemService(MenuItemRepository menuItemRepository,
                           MenuCategoryRepository categoryRepository,
                           ModifierGroupRepository modifierGroupRepository,
                           RecipeRepository recipeRepository,
                           ModifierService modifierService) {
        this.menuItemRepository = menuItemRepository;
        this.categoryRepository = categoryRepository;
        this.modifierGroupRepository = modifierGroupRepository;
        this.recipeRepository = recipeRepository;
        this.modifierService = modifierService;
    }

    @Transactional(readOnly = true)
    public Page<MenuItemDto> getMenuItems(String outletId, String categoryId, Boolean available,
                                          Boolean active, String search, Pageable pageable) {
        String query = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        return menuItemRepository.findByFilter(outletId, categoryId, available, active, query, pageable)
                .map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public MenuItemDto getMenuItemById(String id) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", id));
        return mapToDto(item);
    }

    @Transactional
    public MenuItemDto createMenuItem(CreateMenuItemRequest request) {
        MenuCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("MenuCategory", "id", request.getCategoryId()));

        String name = request.getName().trim();
        if (menuItemRepository.existsByCategoryIdAndNameIgnoreCase(category.getId(), name)) {
            throw new BusinessException("Menu item '" + name + "' already exists in category '" + category.getName() + "'");
        }

        MenuItem item = new MenuItem(
                UUID.randomUUID().toString(),
                category,
                name,
                request.getPrice()
        );
        item.setDescription(request.getDescription());
        if (request.getCostPrice() != null) {
            item.setCostPrice(request.getCostPrice());
        }
        if (request.getTaxRate() != null) {
            item.setTaxRate(request.getTaxRate());
        }
        item.setImageUrl(request.getImageUrl());
        if (request.getIsAvailable() != null) {
            item.setAvailable(request.getIsAvailable());
        }
        if (request.getPrepTimeMinutes() != null) {
            item.setPrepTimeMinutes(request.getPrepTimeMinutes());
        }
        item.setSpecialInstructions(request.getSpecialInstructions());

        // Attach modifier groups
        if (request.getModifierGroupIds() != null && !request.getModifierGroupIds().isEmpty()) {
            Set<ModifierGroup> groups = new HashSet<>(modifierGroupRepository.findAllById(request.getModifierGroupIds()));
            item.setModifierGroups(groups);
        }

        MenuItem saved = menuItemRepository.save(item);
        return mapToDto(saved);
    }

    @Transactional
    public MenuItemDto updateMenuItem(String id, UpdateMenuItemRequest request) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", id));

        MenuCategory targetCat = item.getCategory();
        if (request.getCategoryId() != null && !request.getCategoryId().equals(item.getCategory().getId())) {
            targetCat = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("MenuCategory", "id", request.getCategoryId()));
            item.setCategory(targetCat);
        }

        String name = request.getName().trim();
        if (menuItemRepository.existsByCategoryIdAndNameIgnoreCaseAndIdNot(targetCat.getId(), name, id)) {
            throw new BusinessException("Menu item '" + name + "' already exists in category '" + targetCat.getName() + "'");
        }

        item.setName(name);
        item.setDescription(request.getDescription());
        item.setPrice(request.getPrice());
        if (request.getCostPrice() != null) {
            item.setCostPrice(request.getCostPrice());
        }
        if (request.getTaxRate() != null) {
            item.setTaxRate(request.getTaxRate());
        }
        if (request.getImageUrl() != null) {
            item.setImageUrl(request.getImageUrl());
        }
        if (request.getIsAvailable() != null) {
            item.setAvailable(request.getIsAvailable());
        }
        if (request.getPrepTimeMinutes() != null) {
            item.setPrepTimeMinutes(request.getPrepTimeMinutes());
        }
        if (request.getSpecialInstructions() != null) {
            item.setSpecialInstructions(request.getSpecialInstructions());
        }
        if (request.getActive() != null) {
            item.setActive(request.getActive());
        }

        // Update modifier groups
        if (request.getModifierGroupIds() != null) {
            Set<ModifierGroup> groups = new HashSet<>(modifierGroupRepository.findAllById(request.getModifierGroupIds()));
            item.setModifierGroups(groups);
        }

        MenuItem saved = menuItemRepository.save(item);
        return mapToDto(saved);
    }

    @Transactional
    public MenuItemDto updateAvailability(String id, boolean isAvailable) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", id));
        item.setAvailable(isAvailable);
        MenuItem saved = menuItemRepository.save(item);
        return mapToDto(saved);
    }

    @Transactional
    public void deleteMenuItem(String id) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", id));
        menuItemRepository.delete(item);
    }

    public MenuItemDto mapToDto(MenuItem item) {
        boolean hasRecipe = recipeRepository.existsByMenuItemId(item.getId());

        // Calculate Gross Profit Margin: ((Price - CostPrice) / Price) * 100
        BigDecimal profitMargin = BigDecimal.ZERO;
        if (item.getPrice() != null && item.getPrice().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal cost = item.getCostPrice() != null ? item.getCostPrice() : BigDecimal.ZERO;
            BigDecimal diff = item.getPrice().subtract(cost);
            profitMargin = diff.divide(item.getPrice(), 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")).setScale(2, RoundingMode.HALF_UP);
        }

        List<ModifierGroupDto> groupDtos = item.getModifierGroups().stream()
                .map(modifierService::mapToDto)
                .collect(Collectors.toList());

        String outletId = item.getCategory().getOutlet() != null ? item.getCategory().getOutlet().getId() : null;

        return new MenuItemDto(
                item.getId(),
                item.getCategory().getId(),
                item.getCategory().getName(),
                outletId,
                item.getName(),
                item.getDescription(),
                item.getPrice(),
                item.getCostPrice(),
                item.getTaxRate(),
                item.getImageUrl(),
                item.isAvailable(),
                item.getPrepTimeMinutes(),
                item.getSpecialInstructions(),
                item.isActive(),
                profitMargin,
                hasRecipe,
                groupDtos,
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }
}
