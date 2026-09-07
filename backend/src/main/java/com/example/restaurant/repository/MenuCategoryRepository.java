package com.example.restaurant.repository;

import com.example.restaurant.entity.MenuCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuCategoryRepository extends JpaRepository<MenuCategory, String> {

    List<MenuCategory> findByOutletIdOrderByDisplayOrderAsc(String outletId);

    List<MenuCategory> findByOutletIdAndActiveTrueOrderByDisplayOrderAsc(String outletId);

    boolean existsByOutletIdAndNameIgnoreCase(String outletId, String name);

    boolean existsByOutletIdAndNameIgnoreCaseAndIdNot(String outletId, String name, String id);
}
