package com.example.restaurant.controller;

import com.example.restaurant.dto.billing.BillDto;
import com.example.restaurant.dto.billing.BillingStatsDto;
import com.example.restaurant.dto.billing.ProcessPaymentRequest;
import com.example.restaurant.dto.response.ApiResponse;
import com.example.restaurant.dto.response.PagedResponse;
import com.example.restaurant.entity.BillStatus;
import com.example.restaurant.service.BillingService;
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
@RequestMapping("/api/bills")
public class BillingController {

    private final BillingService billingService;

    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    @PostMapping("/order/{orderId}")
    @PreAuthorize("hasAnyAuthority('BILL_CREATE', 'ORDER_UPDATE', 'ORDER_CREATE', 'ADMIN')")
    public ResponseEntity<ApiResponse<BillDto>> generateBill(@PathVariable String orderId) {
        BillDto bill = billingService.generateBillForOrder(orderId);
        return new ResponseEntity<>(ApiResponse.ok("Bill generated successfully", bill), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('BILL_VIEW', 'ORDER_VIEW', 'ADMIN')")
    public ResponseEntity<ApiResponse<BillDto>> getBillById(@PathVariable String id) {
        BillDto bill = billingService.getBillById(id);
        return ResponseEntity.ok(ApiResponse.ok(bill));
    }

    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyAuthority('BILL_VIEW', 'ORDER_VIEW', 'ADMIN')")
    public ResponseEntity<ApiResponse<BillDto>> getBillByOrderId(@PathVariable String orderId) {
        BillDto bill = billingService.getBillByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.ok(bill));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('BILL_VIEW', 'ORDER_VIEW', 'ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<BillDto>>> searchBills(
            @RequestParam String outletId,
            @RequestParam(required = false) BillStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PagedResponse<BillDto> response = billingService.searchBills(outletId, status, search, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyAuthority('BILL_VIEW', 'ORDER_VIEW', 'ADMIN')")
    public ResponseEntity<ApiResponse<BillingStatsDto>> getBillingStats(@RequestParam String outletId) {
        BillingStatsDto stats = billingService.getBillingStats(outletId);
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @PostMapping("/{id}/payments")
    @PreAuthorize("hasAnyAuthority('PAYMENT_CREATE', 'BILL_CREATE', 'ADMIN')")
    public ResponseEntity<ApiResponse<BillDto>> processPayment(
            @PathVariable String id,
            @Valid @RequestBody ProcessPaymentRequest request,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        BillDto updatedBill = billingService.processPayment(id, request, username);
        return ResponseEntity.ok(ApiResponse.ok("Payment processed successfully", updatedBill));
    }
}
