package com.example.restaurant.repository;

import com.example.restaurant.entity.RestaurantTable;
import com.example.restaurant.entity.TableStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, String> {

    List<RestaurantTable> findByFloorIdOrderByTableNumberAsc(String floorId);

    List<RestaurantTable> findByFloorOutletIdOrderByTableNumberAsc(String outletId);

    Optional<RestaurantTable> findByFloorIdAndTableNumber(String floorId, String tableNumber);

    boolean existsByFloorIdAndTableNumberIgnoreCase(String floorId, String tableNumber);

    boolean existsByFloorIdAndTableNumberIgnoreCaseAndIdNot(String floorId, String tableNumber, String id);

    long countByFloorId(String floorId);

    long countByFloorOutletId(String outletId);

    long countByFloorOutletIdAndStatus(String outletId, TableStatus status);
}
