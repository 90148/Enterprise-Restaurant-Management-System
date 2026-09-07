package com.example.restaurant.repository;

import com.example.restaurant.entity.ModifierGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModifierGroupRepository extends JpaRepository<ModifierGroup, String> {

    List<ModifierGroup> findByOutletIdOrderByCreatedAtAsc(String outletId);

    List<ModifierGroup> findByOutletIdAndActiveTrueOrderByCreatedAtAsc(String outletId);

    boolean existsByOutletIdAndNameIgnoreCase(String outletId, String name);

    boolean existsByOutletIdAndNameIgnoreCaseAndIdNot(String outletId, String name, String id);
}
