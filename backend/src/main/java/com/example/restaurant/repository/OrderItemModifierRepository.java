package com.example.restaurant.repository;

import com.example.restaurant.entity.OrderItemModifier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemModifierRepository extends JpaRepository<OrderItemModifier, String> {
    List<OrderItemModifier> findByOrderItemId(String orderItemId);
}
