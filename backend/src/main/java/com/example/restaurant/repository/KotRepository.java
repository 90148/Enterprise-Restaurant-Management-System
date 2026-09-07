package com.example.restaurant.repository;

import com.example.restaurant.entity.Kot;
import com.example.restaurant.entity.KotStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface KotRepository extends JpaRepository<Kot, String> {

    List<Kot> findByOutletIdAndStatusInOrderByCreatedAtAsc(String outletId, Collection<KotStatus> statuses);

    List<Kot> findByOutletIdAndStationAndStatusInOrderByCreatedAtAsc(String outletId, String station, Collection<KotStatus> statuses);

    List<Kot> findByOrderIdOrderByCreatedAtDesc(String orderId);

    List<Kot> findByOrderId(String orderId);

    long countByOutletIdAndStatus(String outletId, KotStatus status);

    long countByOutletIdAndStatusIn(String outletId, Collection<KotStatus> statuses);

    @Query("SELECT COUNT(k) FROM Kot k WHERE k.outlet.id = :outletId AND k.createdAt >= :startOfDay")
    long countTodayKots(@Param("outletId") String outletId, @Param("startOfDay") LocalDateTime startOfDay);

    @Query("SELECT k FROM Kot k WHERE k.outlet.id = :outletId AND k.status IN (:bumpedStatuses) ORDER BY k.updatedAt DESC")
    List<Kot> findRecentlyBumpedKots(@Param("outletId") String outletId,
                                     @Param("bumpedStatuses") Collection<KotStatus> bumpedStatuses,
                                     Pageable pageable);

    Optional<Kot> findByKotNumber(String kotNumber);
}
