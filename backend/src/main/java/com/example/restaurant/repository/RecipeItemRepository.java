package com.example.restaurant.repository;

import com.example.restaurant.entity.RecipeItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeItemRepository extends JpaRepository<RecipeItem, String> {

    List<RecipeItem> findByRecipeId(String recipeId);

    void deleteByRecipeId(String recipeId);
}
