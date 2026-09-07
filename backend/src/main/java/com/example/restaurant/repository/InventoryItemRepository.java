package com.example.restaurant.repository;

import com.example.restaurant.entity.InventoryItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, String> {

    List<InventoryItem> findByOutletIdOrderByNameAsc(String outletId);

    Optional<InventoryItem> findByOutletIdAndSku(String outletId, String sku);

    boolean existsByOutletIdAndSku(String outletId, String sku);

    boolean existsByOutletIdAndSkuAndIdNot(String outletId, String sku, String id);

    long countByOutletId(String outletId);

    long countByOutletIdAndStatus(String outletId, String status);

    @Query("SELECT i FROM InventoryItem i WHERE i.outlet.id = :outletId " +
           "AND (:status IS NULL OR i.status = :status) " +
           "AND (:search IS NULL OR LOWER(i.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(i.sku) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<InventoryItem> searchItems(@Param("outletId") String outletId,
                                    @Param("status") String status,
                                    @Param("search") String search,
                                    Pageable pageable);

    @Query("SELECT COALESCE(SUM(i.currentStock * i.unitCost), 0) FROM InventoryItem i WHERE i.outlet.id = :outletId")
    BigDecimal calculateTotalValuation(@Param("outletId") String outletId);

    @Query("SELECT i FROM InventoryItem i WHERE i.outlet.id = :outletId AND i.currentStock <= i.minimumStock ORDER BY i.currentStock ASC")
    List<InventoryItem> findLowStockItems(@Param("outletId") String outletId);
}
