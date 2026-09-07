package com.example.restaurant.controller;

import com.example.restaurant.dto.order.*;
import com.example.restaurant.dto.response.ApiResponse;
import com.example.restaurant.dto.response.PagedResponse;
import com.example.restaurant.entity.OrderStatus;
import com.example.restaurant.entity.OrderType;
import com.example.restaurant.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ORDER_CREATE')")
    public ResponseEntity<ApiResponse<OrderDto>> createOrder(@Valid @RequestBody CreateOrderRequest request,
                                                             Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        OrderDto created = orderService.createOrder(request, username);
        return new ResponseEntity<>(ApiResponse.ok("Order created successfully", created), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ORDER_VIEW')")
    public ResponseEntity<ApiResponse<PagedResponse<OrderDto>>> getOrders(
            @RequestParam String outletId,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) OrderType orderType,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PagedResponse<OrderDto> orders = orderService.searchOrders(outletId, status, orderType, search, pageable);
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ORDER_VIEW')")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderById(@PathVariable String id) {
        OrderDto order = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.ok(order));
    }

    @GetMapping("/table/{tableId}/active")
    @PreAuthorize("hasAuthority('ORDER_VIEW')")
    public ResponseEntity<ApiResponse<OrderDto>> getActiveOrderByTable(@PathVariable String tableId,
                                                                       @RequestParam String outletId) {
        OrderDto order = orderService.getActiveOrderByTable(outletId, tableId);
        return ResponseEntity.ok(ApiResponse.ok(order));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('ORDER_VIEW')")
    public ResponseEntity<ApiResponse<OrderStatsDto>> getOrderStats(@RequestParam String outletId) {
        OrderStatsDto stats = orderService.getOrderStats(outletId);
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @PostMapping("/{id}/items")
    @PreAuthorize("hasAuthority('ORDER_UPDATE')")
    public ResponseEntity<ApiResponse<OrderDto>> addItemsToOrder(@PathVariable String id,
                                                                 @Valid @RequestBody AddOrderItemsRequest request) {
        OrderDto updated = orderService.addItemsToOrder(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Items added to order successfully", updated));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ORDER_UPDATE')")
    public ResponseEntity<ApiResponse<OrderDto>> updateOrderStatus(@PathVariable String id,
                                                                   @Valid @RequestBody UpdateOrderStatusRequest request) {
        OrderDto updated = orderService.updateOrderStatus(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Order status updated to " + request.getStatus(), updated));
    }

    @PostMapping("/{id}/discount")
    @PreAuthorize("hasAuthority('ORDER_UPDATE')")
    public ResponseEntity<ApiResponse<OrderDto>> applyDiscount(@PathVariable String id,
                                                               @Valid @RequestBody ApplyDiscountRequest request) {
        OrderDto updated = orderService.applyDiscount(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Discount applied successfully", updated));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyAuthority('ORDER_CANCEL', 'ORDER_UPDATE')")
    public ResponseEntity<ApiResponse<OrderDto>> cancelOrder(@PathVariable String id,
                                                             @RequestBody(required = false) Map<String, String> body) {
        String reason = (body != null && body.containsKey("reason")) ? body.get("reason") : "Order cancelled by staff";
        UpdateOrderStatusRequest req = new UpdateOrderStatusRequest(OrderStatus.CANCELLED, reason);
        OrderDto cancelled = orderService.updateOrderStatus(id, req);
        return ResponseEntity.ok(ApiResponse.ok("Order cancelled successfully", cancelled));
    }
}
