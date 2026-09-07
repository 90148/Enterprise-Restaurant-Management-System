package com.example.restaurant.controller;

import com.example.restaurant.dto.report.*;
import com.example.restaurant.dto.response.ApiResponse;
import com.example.restaurant.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@Tag(name = "Reports & Analytics", description = "Endpoints for financial, operational, and performance reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasAnyAuthority('REPORT_VIEW', 'ORDER_VIEW', 'ROLE_ADMIN') or hasRole('ADMIN')")
    @Operation(summary = "Get real-time live operational metrics for Dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboardStats(
            @RequestParam(required = false) String outletId) {
        DashboardStatsDto stats = reportService.getDashboardStats(outletId);
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/sales/summary")
    @PreAuthorize("hasAnyAuthority('REPORT_VIEW', 'ROLE_ADMIN') or hasRole('ADMIN')")
    @Operation(summary = "Get sales revenue summary across date range")
    public ResponseEntity<ApiResponse<SalesSummaryDto>> getSalesSummary(
            @RequestParam(required = false) String outletId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        SalesSummaryDto summary = reportService.getSalesSummary(outletId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }

    @GetMapping("/sales/daily")
    @PreAuthorize("hasAnyAuthority('REPORT_VIEW', 'ROLE_ADMIN') or hasRole('ADMIN')")
    @Operation(summary = "Get daily sales breakdown")
    public ResponseEntity<ApiResponse<List<DailySalesDto>>> getDailySales(
            @RequestParam(required = false) String outletId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<DailySalesDto> daily = reportService.getDailySales(outletId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(daily));
    }

    @GetMapping("/sales/hourly")
    @PreAuthorize("hasAnyAuthority('REPORT_VIEW', 'ROLE_ADMIN') or hasRole('ADMIN')")
    @Operation(summary = "Get hourly sales curve for a given date")
    public ResponseEntity<ApiResponse<List<HourlySalesDto>>> getHourlySales(
            @RequestParam(required = false) String outletId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<HourlySalesDto> hourly = reportService.getHourlySales(outletId, date);
        return ResponseEntity.ok(ApiResponse.ok(hourly));
    }

    @GetMapping("/sales/payment-methods")
    @PreAuthorize("hasAnyAuthority('REPORT_VIEW', 'ROLE_ADMIN') or hasRole('ADMIN')")
    @Operation(summary = "Get tender method distribution")
    public ResponseEntity<ApiResponse<List<PaymentMethodSummaryDto>>> getPaymentMethodBreakdown(
            @RequestParam(required = false) String outletId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<PaymentMethodSummaryDto> breakdown = reportService.getPaymentMethodBreakdown(outletId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(breakdown));
    }

    @GetMapping("/sales/order-types")
    @PreAuthorize("hasAnyAuthority('REPORT_VIEW', 'ROLE_ADMIN') or hasRole('ADMIN')")
    @Operation(summary = "Get sales distribution by order type")
    public ResponseEntity<ApiResponse<List<OrderTypeSummaryDto>>> getOrderTypeBreakdown(
            @RequestParam(required = false) String outletId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<OrderTypeSummaryDto> breakdown = reportService.getOrderTypeBreakdown(outletId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(breakdown));
    }

    @GetMapping("/items/top-selling")
    @PreAuthorize("hasAnyAuthority('REPORT_VIEW', 'ROLE_ADMIN') or hasRole('ADMIN')")
    @Operation(summary = "Get top selling dishes by volume and revenue")
    public ResponseEntity<ApiResponse<List<TopSellingItemDto>>> getTopSellingItems(
            @RequestParam(required = false) String outletId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "10") int limit) {
        List<TopSellingItemDto> topItems = reportService.getTopSellingItems(outletId, startDate, endDate, limit);
        return ResponseEntity.ok(ApiResponse.ok(topItems));
    }

    @GetMapping("/categories/performance")
    @PreAuthorize("hasAnyAuthority('REPORT_VIEW', 'ROLE_ADMIN') or hasRole('ADMIN')")
    @Operation(summary = "Get menu category performance")
    public ResponseEntity<ApiResponse<List<CategorySalesDto>>> getCategorySales(
            @RequestParam(required = false) String outletId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<CategorySalesDto> catSales = reportService.getCategorySales(outletId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(catSales));
    }

    @GetMapping("/inventory/consumption")
    @PreAuthorize("hasAnyAuthority('REPORT_VIEW', 'INVENTORY_VIEW', 'ROLE_ADMIN') or hasRole('ADMIN')")
    @Operation(summary = "Get inventory stock consumption and wastage summary")
    public ResponseEntity<ApiResponse<List<InventoryConsumptionSummaryDto>>> getInventoryConsumption(
            @RequestParam(required = false) String outletId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<InventoryConsumptionSummaryDto> consumption = reportService.getInventoryConsumption(outletId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(consumption));
    }

    @GetMapping("/sales/export")
    @PreAuthorize("hasAnyAuthority('REPORT_EXPORT', 'REPORT_VIEW', 'ROLE_ADMIN') or hasRole('ADMIN')")
    @Operation(summary = "Export detailed sales report as CSV")
    public ResponseEntity<String> exportSalesReportCsv(
            @RequestParam(required = false) String outletId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        String csvContent = reportService.exportSalesReportCsv(outletId, startDate, endDate);
        String filename = "sales-report-" + LocalDate.now() + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvContent);
    }
}
