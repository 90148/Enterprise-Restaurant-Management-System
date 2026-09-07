package com.example.restaurant.repository;

import com.example.restaurant.entity.Modifier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModifierRepository extends JpaRepository<Modifier, String> {

    List<Modifier> findByModifierGroupIdAndActiveTrue(String modifierGroupId);

    List<Modifier> findByModifierGroupId(String modifierGroupId);
}
