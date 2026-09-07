package com.example.restaurant.repository;

import com.example.restaurant.entity.KotItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KotItemRepository extends JpaRepository<KotItem, String> {
    List<KotItem> findByKotId(String kotId);
}
