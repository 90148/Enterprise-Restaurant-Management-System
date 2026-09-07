package com.example.restaurant.repository;

import com.example.restaurant.entity.PurchaseOrder;
import com.example.restaurant.entity.PurchaseOrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, String> {

    Optional<PurchaseOrder> findByPoNumber(String poNumber);

    Page<PurchaseOrder> findByOutletId(String outletId, Pageable pageable);

    Page<PurchaseOrder> findByOutletIdAndStatus(String outletId, PurchaseOrderStatus status, Pageable pageable);

    long countByOutletIdAndStatus(String outletId, PurchaseOrderStatus status);

    @Query("SELECT COUNT(p) FROM PurchaseOrder p WHERE p.outlet.id = :outletId AND p.createdAt >= :startOfDay")
    long countTodayPOs(@Param("outletId") String outletId, @Param("startOfDay") LocalDateTime startOfDay);

    @Query("SELECT p FROM PurchaseOrder p WHERE p.outlet.id = :outletId " +
           "AND (:status IS NULL OR p.status = :status) " +
           "AND (:search IS NULL OR LOWER(p.poNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.supplierName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<PurchaseOrder> searchPOs(@Param("outletId") String outletId,
                                  @Param("status") PurchaseOrderStatus status,
                                  @Param("search") String search,
                                  Pageable pageable);
}
