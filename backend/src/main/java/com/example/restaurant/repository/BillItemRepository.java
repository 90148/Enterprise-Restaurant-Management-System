package com.example.restaurant.repository;

import com.example.restaurant.entity.BillItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillItemRepository extends JpaRepository<BillItem, String> {

    List<BillItem> findByBillId(String billId);
}
