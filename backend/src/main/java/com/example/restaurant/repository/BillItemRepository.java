package com.example.restaurant.repository;

import com.example.restaurant.entity.BillItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BillItemRepository extends JpaRepository<BillItem, String> {

    List<BillItem> findByBillId(String billId);

    @Query("SELECT bi.itemName, " +
           "COALESCE(bi.menuItem.id, ''), " +
           "COALESCE(bi.menuItem.category.name, 'General'), " +
           "SUM(bi.quantity), " +
           "SUM(bi.subtotal), " +
           "AVG(bi.unitPrice) " +
           "FROM BillItem bi WHERE bi.bill.outlet.id = :outletId " +
           "AND bi.bill.status = 'PAID' " +
           "AND bi.bill.createdAt >= :startDate AND bi.bill.createdAt <= :endDate " +
           "GROUP BY bi.itemName, bi.menuItem.id, bi.menuItem.category.name " +
           "ORDER BY SUM(bi.subtotal) DESC")
    List<Object[]> findTopSellingItems(@Param("outletId") String outletId,
                                       @Param("startDate") LocalDateTime startDate,
                                       @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COALESCE(bi.menuItem.category.id, ''), " +
           "COALESCE(bi.menuItem.category.name, 'General'), " +
           "SUM(bi.quantity), " +
           "SUM(bi.subtotal) " +
           "FROM BillItem bi WHERE bi.bill.outlet.id = :outletId " +
           "AND bi.bill.status = 'PAID' " +
           "AND bi.bill.createdAt >= :startDate AND bi.bill.createdAt <= :endDate " +
           "GROUP BY bi.menuItem.category.id, bi.menuItem.category.name " +
           "ORDER BY SUM(bi.subtotal) DESC")
    List<Object[]> findCategorySales(@Param("outletId") String outletId,
                                     @Param("startDate") LocalDateTime startDate,
                                     @Param("endDate") LocalDateTime endDate);
}
