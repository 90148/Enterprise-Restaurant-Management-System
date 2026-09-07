package com.example.restaurant.repository;

import com.example.restaurant.entity.InventoryTransaction;
import com.example.restaurant.entity.InventoryTransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, String> {

    List<InventoryTransaction> findByInventoryItemIdOrderByCreatedAtDesc(String inventoryItemId);

    Page<InventoryTransaction> findByInventoryItemOutletIdOrderByCreatedAtDesc(String outletId, Pageable pageable);

    boolean existsByReferenceIdAndTransactionType(String referenceId, InventoryTransactionType transactionType);

    List<InventoryTransaction> findByReferenceId(String referenceId);

    @Query("SELECT it.transactionType, COUNT(it), SUM(ABS(it.quantityChanged)) " +
           "FROM InventoryTransaction it WHERE it.inventoryItem.outlet.id = :outletId " +
           "AND it.createdAt >= :startDate AND it.createdAt <= :endDate " +
           "GROUP BY it.transactionType")
    List<Object[]> findConsumptionByType(@Param("outletId") String outletId,
                                         @Param("startDate") LocalDateTime startDate,
                                         @Param("endDate") LocalDateTime endDate);
}
