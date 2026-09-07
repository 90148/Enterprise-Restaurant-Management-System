package com.example.restaurant.service;

import com.example.restaurant.dto.floor.CreateFloorRequest;
import com.example.restaurant.dto.floor.FloorDto;
import com.example.restaurant.dto.floor.UpdateFloorRequest;
import com.example.restaurant.entity.Floor;
import com.example.restaurant.entity.Outlet;
import com.example.restaurant.exception.BusinessException;
import com.example.restaurant.exception.ResourceNotFoundException;
import com.example.restaurant.repository.FloorRepository;
import com.example.restaurant.repository.OutletRepository;
import com.example.restaurant.repository.RestaurantTableRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FloorService {

    private final FloorRepository floorRepository;
    private final OutletRepository outletRepository;
    private final RestaurantTableRepository restaurantTableRepository;

    public FloorService(FloorRepository floorRepository, OutletRepository outletRepository, RestaurantTableRepository restaurantTableRepository) {
        this.floorRepository = floorRepository;
        this.outletRepository = outletRepository;
        this.restaurantTableRepository = restaurantTableRepository;
    }

    @Transactional(readOnly = true)
    public List<FloorDto> getFloorsByOutlet(String outletId, Boolean activeOnly) {
        List<Floor> floors;
        if (Boolean.TRUE.equals(activeOnly)) {
            floors = floorRepository.findByOutletIdAndActiveTrueOrderByFloorNumberAsc(outletId);
        } else {
            floors = floorRepository.findByOutletIdOrderByFloorNumberAsc(outletId);
        }
        return floors.stream().map(this::mapToFloorDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FloorDto getFloorById(String id) {
        Floor floor = floorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Floor", "id", id));
        return mapToFloorDto(floor);
    }

    @Transactional
    public FloorDto createFloor(CreateFloorRequest request) {
        Outlet outlet = outletRepository.findById(request.getOutletId())
                .orElseThrow(() -> new ResourceNotFoundException("Outlet", "id", request.getOutletId()));

        if (floorRepository.existsByOutletIdAndNameIgnoreCase(outlet.getId(), request.getName().trim())) {
            throw new BusinessException("A floor named '" + request.getName().trim() + "' already exists in this outlet");
        }

        if (floorRepository.existsByOutletIdAndFloorNumber(outlet.getId(), request.getFloorNumber())) {
            throw new BusinessException("Floor number " + request.getFloorNumber() + " already exists in this outlet");
        }

        Floor floor = new Floor(
                UUID.randomUUID().toString(),
                outlet,
                request.getName().trim(),
                request.getFloorNumber()
        );
        if (request.getActive() != null) {
            floor.setActive(request.getActive());
        }

        Floor saved = floorRepository.save(floor);
        return mapToFloorDto(saved);
    }

    @Transactional
    public FloorDto updateFloor(String id, UpdateFloorRequest request) {
        Floor floor = floorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Floor", "id", id));

        String outletId = floor.getOutlet().getId();

        if (floorRepository.existsByOutletIdAndNameIgnoreCaseAndIdNot(outletId, request.getName().trim(), id)) {
            throw new BusinessException("A floor named '" + request.getName().trim() + "' already exists in this outlet");
        }

        if (floorRepository.existsByOutletIdAndFloorNumberAndIdNot(outletId, request.getFloorNumber(), id)) {
            throw new BusinessException("Floor number " + request.getFloorNumber() + " already exists in this outlet");
        }

        floor.setName(request.getName().trim());
        floor.setFloorNumber(request.getFloorNumber());
        if (request.getActive() != null) {
            floor.setActive(request.getActive());
        }

        Floor saved = floorRepository.save(floor);
        return mapToFloorDto(saved);
    }

    @Transactional
    public void deleteFloor(String id) {
        Floor floor = floorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Floor", "id", id));

        long tableCount = restaurantTableRepository.countByFloorId(id);
        if (tableCount > 0) {
            throw new BusinessException("Cannot delete floor '" + floor.getName() + "' because it currently contains "
                    + tableCount + " table(s). Please delete or reassign all tables first.");
        }

        floorRepository.delete(floor);
    }

    public FloorDto mapToFloorDto(Floor floor) {
        long tableCount = restaurantTableRepository.countByFloorId(floor.getId());
        return new FloorDto(
                floor.getId(),
                floor.getOutlet().getId(),
                floor.getOutlet().getName(),
                floor.getName(),
                floor.getFloorNumber(),
                floor.isActive(),
                tableCount,
                floor.getCreatedAt(),
                floor.getUpdatedAt()
        );
    }
}
