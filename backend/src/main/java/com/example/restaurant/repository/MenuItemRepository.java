package com.example.restaurant.repository;

import com.example.restaurant.entity.MenuItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, String> {

    List<MenuItem> findByCategoryIdOrderByPriceAsc(String categoryId);

    List<MenuItem> findByCategoryOutletIdOrderByCategoryDisplayOrderAsc(String outletId);

    long countByCategoryId(String categoryId);

    boolean existsByCategoryIdAndNameIgnoreCase(String categoryId, String name);

    boolean existsByCategoryIdAndNameIgnoreCaseAndIdNot(String categoryId, String name, String id);

    @Query("SELECT m FROM MenuItem m WHERE " +
            "(:outletId IS NULL OR m.category.outlet.id = :outletId) AND " +
            "(:categoryId IS NULL OR m.category.id = :categoryId) AND " +
            "(:available IS NULL OR m.isAvailable = :available) AND " +
            "(:active IS NULL OR m.active = :active) AND " +
            "(:search IS NULL OR LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(m.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<MenuItem> findByFilter(
            @Param("outletId") String outletId,
            @Param("categoryId") String categoryId,
            @Param("available") Boolean available,
            @Param("active") Boolean active,
            @Param("search") String search,
            Pageable pageable
    );
}
