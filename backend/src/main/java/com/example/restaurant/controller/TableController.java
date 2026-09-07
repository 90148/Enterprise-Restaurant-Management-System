package com.example.restaurant.controller;

import com.example.restaurant.dto.response.ApiResponse;
import com.example.restaurant.dto.table.*;
import com.example.restaurant.service.TableService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tables")
public class TableController {

    private final TableService tableService;

    public TableController(TableService tableService) {
        this.tableService = tableService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('OUTLET_VIEW')")
    public ResponseEntity<ApiResponse<List<TableDto>>> getTables(
            @RequestParam(required = false) String floorId,
            @RequestParam(required = false) String outletId) {
        List<TableDto> tables;
        if (floorId != null && !floorId.trim().isEmpty()) {
            tables = tableService.getTablesByFloor(floorId);
        } else if (outletId != null && !outletId.trim().isEmpty()) {
            tables = tableService.getTablesByOutlet(outletId);
        } else {
            tables = List.of();
        }
        return ResponseEntity.ok(ApiResponse.ok(tables));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('OUTLET_VIEW')")
    public ResponseEntity<ApiResponse<TableStatsDto>> getStats(@RequestParam String outletId) {
        TableStatsDto stats = tableService.getStatsByOutlet(outletId);
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('OUTLET_VIEW')")
    public ResponseEntity<ApiResponse<TableDto>> getTableById(@PathVariable String id) {
        TableDto table = tableService.getTableById(id);
        return ResponseEntity.ok(ApiResponse.ok(table));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('OUTLET_UPDATE')")
    public ResponseEntity<ApiResponse<TableDto>> createTable(@Valid @RequestBody CreateTableRequest request) {
        TableDto created = tableService.createTable(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Table created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('OUTLET_UPDATE')")
    public ResponseEntity<ApiResponse<TableDto>> updateTable(
            @PathVariable String id,
            @Valid @RequestBody UpdateTableRequest request) {
        TableDto updated = tableService.updateTable(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Table updated successfully", updated));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ORDER_CREATE', 'ORDER_UPDATE', 'OUTLET_UPDATE')")
    public ResponseEntity<ApiResponse<TableDto>> updateTableStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateTableStatusRequest request) {
        TableDto updated = tableService.updateTableStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.ok("Table status updated to " + request.getStatus(), updated));
    }

    @PatchMapping("/positions")
    @PreAuthorize("hasAuthority('OUTLET_UPDATE')")
    public ResponseEntity<ApiResponse<List<TableDto>>> updateTablePositions(
            @Valid @RequestBody List<TablePositionDto> request) {
        List<TableDto> updated = tableService.updatePositions(request);
        return ResponseEntity.ok(ApiResponse.ok("Table positions updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('OUTLET_UPDATE')")
    public ResponseEntity<ApiResponse<Void>> deleteTable(@PathVariable String id) {
        tableService.deleteTable(id);
        return ResponseEntity.ok(ApiResponse.ok("Table deleted successfully", null));
    }
}
