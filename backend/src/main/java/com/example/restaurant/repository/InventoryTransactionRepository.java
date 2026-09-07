package com.example.restaurant.repository;

import com.example.restaurant.entity.InventoryTransaction;
import com.example.restaurant.entity.InventoryTransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, String> {

    List<InventoryTransaction> findByInventoryItemIdOrderByCreatedAtDesc(String inventoryItemId);

    Page<InventoryTransaction> findByInventoryItemOutletIdOrderByCreatedAtDesc(String outletId, Pageable pageable);

    boolean existsByReferenceIdAndTransactionType(String referenceId, InventoryTransactionType transactionType);

    List<InventoryTransaction> findByReferenceId(String referenceId);
}
