package com.example.restaurant.repository;

import com.example.restaurant.entity.Outlet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OutletRepository extends JpaRepository<Outlet, String> {

    Optional<Outlet> findByCode(String code);

    boolean existsByCode(String code);

    List<Outlet> findByActiveTrue();

    @Query("SELECT o FROM Outlet o WHERE " +
            "(:search IS NULL OR LOWER(o.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(o.code) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:active IS NULL OR o.active = :active)")
    Page<Outlet> findByFilter(
            @Param("search") String search,
            @Param("active") Boolean active,
            Pageable pageable
    );
}
