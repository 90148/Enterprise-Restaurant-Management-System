package com.example.restaurant.repository;

import com.example.restaurant.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {

    List<Payment> findByBillIdOrderByCreatedAtDesc(String billId);

    List<Payment> findByOutletIdOrderByCreatedAtDesc(String outletId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.outlet.id = :outletId AND p.status = 'SUCCESS' AND p.createdAt >= :startOfDay")
    BigDecimal sumTodayPayments(@Param("outletId") String outletId, @Param("startOfDay") LocalDateTime startOfDay);

    @Query("SELECT p.paymentMethod, COUNT(p), SUM(p.amount) " +
           "FROM Payment p WHERE p.outlet.id = :outletId " +
           "AND p.status = 'SUCCESS' " +
           "AND p.createdAt >= :startDate AND p.createdAt <= :endDate " +
           "GROUP BY p.paymentMethod " +
           "ORDER BY SUM(p.amount) DESC")
    List<Object[]> findPaymentMethodBreakdown(@Param("outletId") String outletId,
                                             @Param("startDate") LocalDateTime startDate,
                                             @Param("endDate") LocalDateTime endDate);

    List<Payment> findByOutletIdAndCreatedAtBetweenOrderByCreatedAtAsc(String outletId, LocalDateTime start, LocalDateTime end);
}
