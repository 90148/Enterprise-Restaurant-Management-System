package com.example.restaurant.repository;

import com.example.restaurant.entity.RefundTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RefundRepository extends JpaRepository<RefundTransaction, String> {

    List<RefundTransaction> findByPaymentBillOutletIdOrderByCreatedAtDesc(String outletId);

    List<RefundTransaction> findByPaymentId(String paymentId);

    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM RefundTransaction r WHERE r.payment.outlet.id = :outletId AND r.createdAt >= :startOfDay")
    BigDecimal sumTodayRefunds(@Param("outletId") String outletId, @Param("startOfDay") LocalDateTime startOfDay);

    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM RefundTransaction r WHERE r.payment.outlet.id = :outletId AND r.createdAt >= :startDate AND r.createdAt <= :endDate")
    BigDecimal sumRefundsBetween(@Param("outletId") String outletId,
                                 @Param("startDate") LocalDateTime startDate,
                                 @Param("endDate") LocalDateTime endDate);

    List<RefundTransaction> findByPaymentBillOutletIdAndCreatedAtBetweenOrderByCreatedAtAsc(String outletId, LocalDateTime start, LocalDateTime end);
}
