package com.example.restaurant.repository;

import com.example.restaurant.entity.Bill;
import com.example.restaurant.entity.BillStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, String> {

    Optional<Bill> findByOrderId(String orderId);

    List<Bill> findAllByOrderId(String orderId);

    Optional<Bill> findByBillNumber(String billNumber);

    Page<Bill> findByOutletId(String outletId, Pageable pageable);

    Page<Bill> findByOutletIdAndStatus(String outletId, BillStatus status, Pageable pageable);

    long countByOutletIdAndStatus(String outletId, BillStatus status);

    @Query("SELECT COUNT(b) FROM Bill b WHERE b.outlet.id = :outletId AND b.createdAt >= :startOfDay")
    long countTodayBills(@Param("outletId") String outletId, @Param("startOfDay") LocalDateTime startOfDay);

    @Query("SELECT COALESCE(SUM(b.paidAmount), 0) FROM Bill b WHERE b.outlet.id = :outletId AND b.status = 'PAID' AND b.createdAt >= :startOfDay")
    BigDecimal sumTodayRevenue(@Param("outletId") String outletId, @Param("startOfDay") LocalDateTime startOfDay);

    @Query("SELECT b FROM Bill b WHERE b.outlet.id = :outletId " +
           "AND (:status IS NULL OR b.status = :status) " +
           "AND (:search IS NULL OR LOWER(b.billNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(b.order.orderNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Bill> searchBills(@Param("outletId") String outletId,
                           @Param("status") BillStatus status,
                           @Param("search") String search,
                           Pageable pageable);
}
