package com.example.restaurant.controller;

import com.example.restaurant.dto.inventory.AdjustStockRequest;
import com.example.restaurant.dto.inventory.InventoryItemDetailDto;
import com.example.restaurant.dto.inventory.InventoryStatsDto;
import com.example.restaurant.dto.inventory.InventoryTransactionDto;
import com.example.restaurant.dto.response.ApiResponse;
import com.example.restaurant.dto.response.PagedResponse;
import com.example.restaurant.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/items")
    @PreAuthorize("hasAnyAuthority('INVENTORY_VIEW', 'ROLE_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<InventoryItemDetailDto>>> searchItems(
            @RequestParam String outletId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "name"));
        PagedResponse<InventoryItemDetailDto> result = inventoryService.searchInventoryItems(outletId, status, search, pageable);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/items/{id}")
    @PreAuthorize("hasAnyAuthority('INVENTORY_VIEW', 'ROLE_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<InventoryItemDetailDto>> getItemById(@PathVariable String id) {
        InventoryItemDetailDto item = inventoryService.getInventoryItemById(id);
        return ResponseEntity.ok(ApiResponse.ok(item));
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyAuthority('INVENTORY_VIEW', 'ROLE_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<InventoryItemDetailDto>>> getLowStockItems(@RequestParam String outletId) {
        List<InventoryItemDetailDto> items = inventoryService.getLowStockItems(outletId);
        return ResponseEntity.ok(ApiResponse.ok(items));
    }

    @PostMapping("/items/{id}/adjust")
    @PreAuthorize("hasAnyAuthority('INVENTORY_UPDATE', 'ROLE_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<InventoryItemDetailDto>> adjustStock(
            @PathVariable String id,
            @Valid @RequestBody AdjustStockRequest request,
            Authentication authentication) {

        String username = authentication != null ? authentication.getName() : null;
        InventoryItemDetailDto updated = inventoryService.adjustStock(id, request, username);
        return ResponseEntity.ok(ApiResponse.ok("Stock adjusted successfully", updated));
    }

    @GetMapping("/items/{id}/transactions")
    @PreAuthorize("hasAnyAuthority('INVENTORY_VIEW', 'ROLE_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<InventoryTransactionDto>>> getItemTransactions(@PathVariable String id) {
        List<InventoryTransactionDto> transactions = inventoryService.getItemTransactions(id);
        return ResponseEntity.ok(ApiResponse.ok(transactions));
    }

    @GetMapping("/transactions")
    @PreAuthorize("hasAnyAuthority('INVENTORY_VIEW', 'ROLE_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<InventoryTransactionDto>>> getOutletTransactions(
            @RequestParam String outletId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PagedResponse<InventoryTransactionDto> transactions = inventoryService.getOutletTransactions(outletId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(transactions));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyAuthority('INVENTORY_VIEW', 'ROLE_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<InventoryStatsDto>> getInventoryStats(@RequestParam String outletId) {
        InventoryStatsDto stats = inventoryService.getInventoryStats(outletId);
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }
}
