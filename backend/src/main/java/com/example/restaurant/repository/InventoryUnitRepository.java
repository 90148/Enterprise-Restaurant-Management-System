package com.example.restaurant.repository;

import com.example.restaurant.entity.InventoryUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryUnitRepository extends JpaRepository<InventoryUnit, String> {

    Optional<InventoryUnit> findBySymbolIgnoreCase(String symbol);

    Optional<InventoryUnit> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    boolean existsBySymbolIgnoreCase(String symbol);
}
