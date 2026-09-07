package com.example.restaurant.repository;

import com.example.restaurant.entity.Order;
import com.example.restaurant.entity.OrderStatus;
import com.example.restaurant.entity.OrderType;
import org.springframework.data.domain.Page;
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
public interface OrderRepository extends JpaRepository<Order, String> {

    @Query("SELECT o FROM Order o WHERE o.outlet.id = :outletId " +
           "AND (:status IS NULL OR o.status = :status) " +
           "AND (:orderType IS NULL OR o.orderType = :orderType) " +
           "AND (:search IS NULL OR LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(o.customerName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR o.customerPhone LIKE CONCAT('%', :search, '%'))")
    Page<Order> searchOrders(@Param("outletId") String outletId,
                             @Param("status") OrderStatus status,
                             @Param("orderType") OrderType orderType,
                             @Param("search") String search,
                             Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.outlet.id = :outletId AND o.table.id = :tableId AND o.status NOT IN (:terminalStatuses) ORDER BY o.createdAt DESC")
    List<Order> findActiveOrdersByTable(@Param("outletId") String outletId,
                                        @Param("tableId") String tableId,
                                        @Param("terminalStatuses") Collection<OrderStatus> terminalStatuses);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.table.id = :tableId AND o.status NOT IN (:terminalStatuses)")
    long countActiveOrdersByTable(@Param("tableId") String tableId,
                                  @Param("terminalStatuses") Collection<OrderStatus> terminalStatuses);

    long countByOutletIdAndStatus(String outletId, OrderStatus status);

    long countByOutletIdAndStatusNotIn(String outletId, Collection<OrderStatus> terminalStatuses);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.outlet.id = :outletId AND o.createdAt >= :startOfDay")
    long countTodayOrders(@Param("outletId") String outletId, @Param("startOfDay") LocalDateTime startOfDay);

    Optional<Order> findByOrderNumber(String orderNumber);
}
