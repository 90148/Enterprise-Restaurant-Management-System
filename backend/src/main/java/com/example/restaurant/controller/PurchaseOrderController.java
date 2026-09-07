package com.example.restaurant.controller;

import com.example.restaurant.dto.inventory.CreatePurchaseOrderRequest;
import com.example.restaurant.dto.inventory.PurchaseOrderDto;
import com.example.restaurant.dto.response.ApiResponse;
import com.example.restaurant.dto.response.PagedResponse;
import com.example.restaurant.entity.PurchaseOrderStatus;
import com.example.restaurant.service.PurchaseOrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/purchases")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    public PurchaseOrderController(PurchaseOrderService purchaseOrderService) {
        this.purchaseOrderService = purchaseOrderService;
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('PURCHASE_CREATE', 'INVENTORY_UPDATE', 'ROLE_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> createPurchaseOrder(
            @Valid @RequestBody CreatePurchaseOrderRequest request,
            Authentication authentication) {

        String username = authentication != null ? authentication.getName() : null;
        PurchaseOrderDto po = purchaseOrderService.createPurchaseOrder(request, username);
        return new ResponseEntity<>(ApiResponse.ok("Purchase order created successfully", po), HttpStatus.CREATED);
    }

    @PostMapping("/{id}/receive")
    @PreAuthorize("hasAnyAuthority('PURCHASE_UPDATE', 'INVENTORY_UPDATE', 'ROLE_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> receivePurchaseOrder(
            @PathVariable String id,
            Authentication authentication) {

        String username = authentication != null ? authentication.getName() : null;
        PurchaseOrderDto po = purchaseOrderService.receivePurchaseOrder(id, username);
        return ResponseEntity.ok(ApiResponse.ok("Purchase order received and stock updated successfully", po));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('PURCHASE_VIEW', 'INVENTORY_VIEW', 'ROLE_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> getPOById(@PathVariable String id) {
        PurchaseOrderDto po = purchaseOrderService.getPOById(id);
        return ResponseEntity.ok(ApiResponse.ok(po));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('PURCHASE_VIEW', 'INVENTORY_VIEW', 'ROLE_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<PurchaseOrderDto>>> searchPOs(
            @RequestParam String outletId,
            @RequestParam(required = false) PurchaseOrderStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PagedResponse<PurchaseOrderDto> result = purchaseOrderService.searchPOs(outletId, status, search, pageable);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}
