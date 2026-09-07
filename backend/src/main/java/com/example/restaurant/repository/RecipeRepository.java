package com.example.restaurant.repository;

import com.example.restaurant.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, String> {

    Optional<Recipe> findByMenuItemId(String menuItemId);

    boolean existsByMenuItemId(String menuItemId);

    List<Recipe> findByMenuItemCategoryOutletId(String outletId);
}
