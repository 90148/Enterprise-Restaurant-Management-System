package com.example.restaurant.service;

import com.example.restaurant.dto.table.*;
import com.example.restaurant.entity.Floor;
import com.example.restaurant.entity.RestaurantTable;
import com.example.restaurant.entity.TableStatus;
import com.example.restaurant.exception.BusinessException;
import com.example.restaurant.exception.ResourceNotFoundException;
import com.example.restaurant.repository.FloorRepository;
import com.example.restaurant.repository.RestaurantTableRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TableService {

    private final RestaurantTableRepository restaurantTableRepository;
    private final FloorRepository floorRepository;

    public TableService(RestaurantTableRepository restaurantTableRepository, FloorRepository floorRepository) {
        this.restaurantTableRepository = restaurantTableRepository;
        this.floorRepository = floorRepository;
    }

    @Transactional(readOnly = true)
    public List<TableDto> getTablesByFloor(String floorId) {
        return restaurantTableRepository.findByFloorIdOrderByTableNumberAsc(floorId)
                .stream()
                .map(this::mapToTableDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TableDto> getTablesByOutlet(String outletId) {
        return restaurantTableRepository.findByFloorOutletIdOrderByTableNumberAsc(outletId)
                .stream()
                .map(this::mapToTableDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TableDto getTableById(String id) {
        RestaurantTable table = restaurantTableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RestaurantTable", "id", id));
        return mapToTableDto(table);
    }

    @Transactional
    public TableDto createTable(CreateTableRequest request) {
        Floor floor = floorRepository.findById(request.getFloorId())
                .orElseThrow(() -> new ResourceNotFoundException("Floor", "id", request.getFloorId()));

        String tableNumber = request.getTableNumber().trim();
        if (restaurantTableRepository.existsByFloorIdAndTableNumberIgnoreCase(floor.getId(), tableNumber)) {
            throw new BusinessException("Table number '" + tableNumber + "' already exists on floor '" + floor.getName() + "'");
        }

        RestaurantTable table = new RestaurantTable(
                UUID.randomUUID().toString(),
                floor,
                tableNumber,
                request.getCapacity(),
                request.getShape(),
                request.getPosX(),
                request.getPosY()
        );

        RestaurantTable saved = restaurantTableRepository.save(table);
        return mapToTableDto(saved);
    }

    @Transactional
    public TableDto updateTable(String id, UpdateTableRequest request) {
        RestaurantTable table = restaurantTableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RestaurantTable", "id", id));

        Floor targetFloor = table.getFloor();
        if (request.getFloorId() != null && !request.getFloorId().equals(table.getFloor().getId())) {
            targetFloor = floorRepository.findById(request.getFloorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Floor", "id", request.getFloorId()));
            table.setFloor(targetFloor);
        }

        String tableNumber = request.getTableNumber().trim();
        if (restaurantTableRepository.existsByFloorIdAndTableNumberIgnoreCaseAndIdNot(targetFloor.getId(), tableNumber, id)) {
            throw new BusinessException("Table number '" + tableNumber + "' already exists on floor '" + targetFloor.getName() + "'");
        }

        table.setTableNumber(tableNumber);
        table.setCapacity(request.getCapacity());
        if (request.getShape() != null) {
            table.setShape(request.getShape());
        }
        if (request.getPosX() != null) {
            table.setPosX(request.getPosX());
        }
        if (request.getPosY() != null) {
            table.setPosY(request.getPosY());
        }
        if (request.getActive() != null) {
            table.setActive(request.getActive());
        }

        RestaurantTable saved = restaurantTableRepository.save(table);
        return mapToTableDto(saved);
    }

    @Transactional
    public TableDto updateTableStatus(String id, TableStatus status) {
        RestaurantTable table = restaurantTableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RestaurantTable", "id", id));

        table.setStatus(status);
        RestaurantTable saved = restaurantTableRepository.save(table);
        return mapToTableDto(saved);
    }

    @Transactional
    public List<TableDto> updatePositions(List<TablePositionDto> positions) {
        List<TableDto> updatedTables = new ArrayList<>();
        for (TablePositionDto pos : positions) {
            restaurantTableRepository.findById(pos.getId()).ifPresent(table -> {
                table.setPosX(pos.getPosX());
                table.setPosY(pos.getPosY());
                updatedTables.add(mapToTableDto(restaurantTableRepository.save(table)));
            });
        }
        return updatedTables;
    }

    @Transactional
    public void deleteTable(String id) {
        RestaurantTable table = restaurantTableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RestaurantTable", "id", id));

        if (table.getStatus() == TableStatus.OCCUPIED || table.getStatus() == TableStatus.BILLING) {
            throw new BusinessException("Cannot delete table " + table.getTableNumber() + " while its status is "
                    + table.getStatus() + ". Please settle or release the table before deleting.");
        }

        restaurantTableRepository.delete(table);
    }

    @Transactional(readOnly = true)
    public TableStatsDto getStatsByOutlet(String outletId) {
        long total = restaurantTableRepository.countByFloorOutletId(outletId);
        long available = restaurantTableRepository.countByFloorOutletIdAndStatus(outletId, TableStatus.AVAILABLE);
        long occupied = restaurantTableRepository.countByFloorOutletIdAndStatus(outletId, TableStatus.OCCUPIED);
        long reserved = restaurantTableRepository.countByFloorOutletIdAndStatus(outletId, TableStatus.RESERVED);
        long billing = restaurantTableRepository.countByFloorOutletIdAndStatus(outletId, TableStatus.BILLING);

        return new TableStatsDto(outletId, total, available, occupied, reserved, billing);
    }

    public TableDto mapToTableDto(RestaurantTable table) {
        return new TableDto(
                table.getId(),
                table.getFloor().getId(),
                table.getFloor().getName(),
                table.getFloor().getFloorNumber(),
                table.getFloor().getOutlet().getId(),
                table.getTableNumber(),
                table.getCapacity(),
                table.getStatus(),
                table.getShape(),
                table.getPosX(),
                table.getPosY(),
                table.isActive(),
                table.getCreatedAt(),
                table.getUpdatedAt()
        );
    }
}
