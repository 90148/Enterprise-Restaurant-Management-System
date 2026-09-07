package com.example.restaurant.service;

import com.example.restaurant.dto.menu.CreateCategoryRequest;
import com.example.restaurant.dto.menu.MenuCategoryDto;
import com.example.restaurant.dto.menu.UpdateCategoryRequest;
import com.example.restaurant.entity.MenuCategory;
import com.example.restaurant.entity.Outlet;
import com.example.restaurant.exception.BusinessException;
import com.example.restaurant.exception.ResourceNotFoundException;
import com.example.restaurant.repository.MenuCategoryRepository;
import com.example.restaurant.repository.MenuItemRepository;
import com.example.restaurant.repository.OutletRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MenuCategoryService {

    private final MenuCategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final OutletRepository outletRepository;

    public MenuCategoryService(MenuCategoryRepository categoryRepository,
                               MenuItemRepository menuItemRepository,
                               OutletRepository outletRepository) {
        this.categoryRepository = categoryRepository;
        this.menuItemRepository = menuItemRepository;
        this.outletRepository = outletRepository;
    }

    @Transactional(readOnly = true)
    public List<MenuCategoryDto> getCategoriesByOutlet(String outletId, Boolean activeOnly) {
        List<MenuCategory> list;
        if (Boolean.TRUE.equals(activeOnly)) {
            list = categoryRepository.findByOutletIdAndActiveTrueOrderByDisplayOrderAsc(outletId);
        } else {
            list = categoryRepository.findByOutletIdOrderByDisplayOrderAsc(outletId);
        }
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MenuCategoryDto getCategoryById(String id) {
        MenuCategory cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MenuCategory", "id", id));
        return mapToDto(cat);
    }

    @Transactional
    public MenuCategoryDto createCategory(CreateCategoryRequest request) {
        Outlet outlet = outletRepository.findById(request.getOutletId())
                .orElseThrow(() -> new ResourceNotFoundException("Outlet", "id", request.getOutletId()));

        if (categoryRepository.existsByOutletIdAndNameIgnoreCase(outlet.getId(), request.getName().trim())) {
            throw new BusinessException("Category '" + request.getName().trim() + "' already exists in this outlet");
        }

        MenuCategory cat = new MenuCategory(
                UUID.randomUUID().toString(),
                outlet,
                request.getName().trim(),
                request.getDescription(),
                request.getDisplayOrder()
        );
        if (request.getActive() != null) {
            cat.setActive(request.getActive());
        }
        if (request.getKitchenStation() != null && !request.getKitchenStation().isBlank()) {
            cat.setKitchenStation(request.getKitchenStation().toUpperCase());
        }

        MenuCategory saved = categoryRepository.save(cat);
        return mapToDto(saved);
    }

    @Transactional
    public MenuCategoryDto updateCategory(String id, UpdateCategoryRequest request) {
        MenuCategory cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MenuCategory", "id", id));

        String outletId = cat.getOutlet() != null ? cat.getOutlet().getId() : null;
        if (outletId != null && categoryRepository.existsByOutletIdAndNameIgnoreCaseAndIdNot(outletId, request.getName().trim(), id)) {
            throw new BusinessException("Category '" + request.getName().trim() + "' already exists in this outlet");
        }

        cat.setName(request.getName().trim());
        cat.setDescription(request.getDescription());
        if (request.getDisplayOrder() != null) {
            cat.setDisplayOrder(request.getDisplayOrder());
        }
        if (request.getActive() != null) {
            cat.setActive(request.getActive());
        }
        if (request.getKitchenStation() != null && !request.getKitchenStation().isBlank()) {
            cat.setKitchenStation(request.getKitchenStation().toUpperCase());
        }

        MenuCategory saved = categoryRepository.save(cat);
        return mapToDto(saved);
    }

    @Transactional
    public void deleteCategory(String id) {
        MenuCategory cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MenuCategory", "id", id));

        long count = menuItemRepository.countByCategoryId(id);
        if (count > 0) {
            throw new BusinessException("Cannot delete category '" + cat.getName() + "' because it contains "
                    + count + " menu item(s). Please delete or reassign them first.");
        }

        categoryRepository.delete(cat);
    }

    public MenuCategoryDto mapToDto(MenuCategory cat) {
        long count = menuItemRepository.countByCategoryId(cat.getId());
        return new MenuCategoryDto(
                cat.getId(),
                cat.getOutlet() != null ? cat.getOutlet().getId() : null,
                cat.getName(),
                cat.getDescription(),
                cat.getDisplayOrder(),
                cat.isActive(),
                count,
                cat.getKitchenStation(),
                cat.getCreatedAt(),
                cat.getUpdatedAt()
        );
    }
}
