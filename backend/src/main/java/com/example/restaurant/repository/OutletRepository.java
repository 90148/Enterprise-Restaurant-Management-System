package com.example.restaurant.repository;

import com.example.restaurant.entity.Outlet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OutletRepository extends JpaRepository<Outlet, String> {

    Optional<Outlet> findByCode(String code);

    boolean existsByCode(String code);
}
