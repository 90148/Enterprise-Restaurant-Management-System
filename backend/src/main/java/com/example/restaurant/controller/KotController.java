package com.example.restaurant.controller;

import com.example.restaurant.dto.kot.KotDto;
import com.example.restaurant.dto.kot.KotStatsDto;
import com.example.restaurant.dto.kot.UpdateKotItemStatusRequest;
import com.example.restaurant.dto.kot.UpdateKotStatusRequest;
import com.example.restaurant.dto.response.ApiResponse;
import com.example.restaurant.service.KotService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kds")
public class KotController {

    private final KotService kotService;

    public KotController(KotService kotService) {
        this.kotService = kotService;
    }

    @GetMapping("/tickets")
    @PreAuthorize("hasAnyAuthority('KITCHEN_VIEW', 'ORDER_VIEW')")
    public ResponseEntity<ApiResponse<List<KotDto>>> getActiveTickets(
            @RequestParam String outletId,
            @RequestParam(required = false) String station) {
        List<KotDto> tickets = kotService.getActiveKots(outletId, station);
        return ResponseEntity.ok(ApiResponse.ok(tickets));
    }

    @GetMapping("/tickets/{id}")
    @PreAuthorize("hasAnyAuthority('KITCHEN_VIEW', 'ORDER_VIEW')")
    public ResponseEntity<ApiResponse<KotDto>> getTicketById(@PathVariable String id) {
        KotDto ticket = kotService.getKotById(id);
        return ResponseEntity.ok(ApiResponse.ok(ticket));
    }

    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyAuthority('KITCHEN_VIEW', 'ORDER_VIEW')")
    public ResponseEntity<ApiResponse<List<KotDto>>> getTicketsByOrderId(@PathVariable String orderId) {
        List<KotDto> tickets = kotService.getKotsByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.ok(tickets));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyAuthority('KITCHEN_VIEW', 'ORDER_VIEW')")
    public ResponseEntity<ApiResponse<KotStatsDto>> getKitchenStats(@RequestParam String outletId) {
        KotStatsDto stats = kotService.getKotStats(outletId);
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @PatchMapping("/tickets/{id}/status")
    @PreAuthorize("hasAnyAuthority('KITCHEN_UPDATE', 'ORDER_UPDATE')")
    public ResponseEntity<ApiResponse<KotDto>> updateTicketStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateKotStatusRequest request) {
        KotDto updated = kotService.updateKotStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.ok("KOT status updated successfully", updated));
    }

    @PatchMapping("/items/{itemId}/status")
    @PreAuthorize("hasAnyAuthority('KITCHEN_UPDATE', 'ORDER_UPDATE')")
    public ResponseEntity<ApiResponse<KotDto>> updateTicketItemStatus(
            @PathVariable String itemId,
            @Valid @RequestBody UpdateKotItemStatusRequest request) {
        KotDto updated = kotService.updateKotItemStatus(itemId, request.getStatus());
        return ResponseEntity.ok(ApiResponse.ok("KOT item status updated successfully", updated));
    }

    @PostMapping("/recall")
    @PreAuthorize("hasAnyAuthority('KITCHEN_UPDATE', 'ORDER_UPDATE')")
    public ResponseEntity<ApiResponse<KotDto>> recallLastBumped(@RequestParam String outletId) {
        KotDto recalled = kotService.recallLastBumpedKot(outletId);
        return ResponseEntity.ok(ApiResponse.ok("Ticket recalled successfully", recalled));
    }
}
