package com.example.restaurant.repository;

import com.example.restaurant.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, String> {

    List<InventoryItem> findByOutletIdOrderByNameAsc(String outletId);

    Optional<InventoryItem> findByOutletIdAndSku(String outletId, String sku);

    boolean existsByOutletIdAndSku(String outletId, String sku);

    boolean existsByOutletIdAndSkuAndIdNot(String outletId, String sku, String id);
}
