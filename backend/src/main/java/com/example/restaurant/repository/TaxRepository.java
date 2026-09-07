package com.example.restaurant.repository;

import com.example.restaurant.entity.Tax;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaxRepository extends JpaRepository<Tax, String> {

    List<Tax> findByOutletId(String outletId);

    List<Tax> findByOutletIdAndActiveTrue(String outletId);
}
