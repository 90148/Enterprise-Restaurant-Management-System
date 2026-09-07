package com.example.restaurant.controller;

import com.example.restaurant.dto.inventory.RefundDto;
import com.example.restaurant.dto.inventory.RefundRequest;
import com.example.restaurant.dto.response.ApiResponse;
import com.example.restaurant.service.RefundService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/refunds")
public class RefundController {

    private final RefundService refundService;

    public RefundController(RefundService refundService) {
        this.refundService = refundService;
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('PAYMENT_REFUND', 'ROLE_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RefundDto>> processRefund(
            @Valid @RequestBody RefundRequest request,
            Authentication authentication) {

        String username = authentication != null ? authentication.getName() : null;
        RefundDto refund = refundService.processRefund(request, username);
        return new ResponseEntity<>(ApiResponse.ok("Refund processed successfully", refund), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('BILL_VIEW', 'PAYMENT_REFUND', 'ROLE_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<RefundDto>>> getRefundsByOutlet(@RequestParam String outletId) {
        List<RefundDto> refunds = refundService.getRefundsByOutlet(outletId);
        return ResponseEntity.ok(ApiResponse.ok(refunds));
    }

    @GetMapping("/payment/{paymentId}")
    @PreAuthorize("hasAnyAuthority('BILL_VIEW', 'PAYMENT_REFUND', 'ROLE_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<RefundDto>>> getRefundsByPayment(@PathVariable String paymentId) {
        List<RefundDto> refunds = refundService.getRefundsByPayment(paymentId);
        return ResponseEntity.ok(ApiResponse.ok(refunds));
    }
}
