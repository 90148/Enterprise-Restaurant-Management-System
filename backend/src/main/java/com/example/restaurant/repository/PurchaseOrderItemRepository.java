package com.example.restaurant.repository;

import com.example.restaurant.entity.PurchaseOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseOrderItemRepository extends JpaRepository<PurchaseOrderItem, String> {

    List<PurchaseOrderItem> findByPurchaseOrderId(String purchaseOrderId);
}
