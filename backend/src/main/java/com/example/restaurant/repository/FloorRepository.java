package com.example.restaurant.repository;

import com.example.restaurant.entity.Floor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FloorRepository extends JpaRepository<Floor, String> {

    List<Floor> findByOutletIdOrderByFloorNumberAsc(String outletId);

    List<Floor> findByOutletIdAndActiveTrueOrderByFloorNumberAsc(String outletId);

    boolean existsByOutletIdAndNameIgnoreCase(String outletId, String name);

    boolean existsByOutletIdAndNameIgnoreCaseAndIdNot(String outletId, String name, String id);

    boolean existsByOutletIdAndFloorNumber(String outletId, Integer floorNumber);

    boolean existsByOutletIdAndFloorNumberAndIdNot(String outletId, Integer floorNumber, String id);
}
