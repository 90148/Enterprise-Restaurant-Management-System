package com.example.restaurant.service;

import com.example.restaurant.dto.kot.*;
import com.example.restaurant.entity.*;
import com.example.restaurant.exception.BusinessException;
import com.example.restaurant.exception.ResourceNotFoundException;
import com.example.restaurant.repository.KotItemRepository;
import com.example.restaurant.repository.KotRepository;
import com.example.restaurant.repository.OrderRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class KotService {

    private final KotRepository kotRepository;
    private final KotItemRepository kotItemRepository;
    private final OrderRepository orderRepository;
    private final WebSocketEventService webSocketEventService;

    private static final List<KotStatus> ACTIVE_STATUSES = List.of(KotStatus.NEW, KotStatus.PREPARING, KotStatus.READY);

    public KotService(KotRepository kotRepository,
                      KotItemRepository kotItemRepository,
                      OrderRepository orderRepository,
                      WebSocketEventService webSocketEventService) {
        this.kotRepository = kotRepository;
        this.kotItemRepository = kotItemRepository;
        this.orderRepository = orderRepository;
        this.webSocketEventService = webSocketEventService;
    }

    @Transactional
    public KotDto createKotForOrder(Order order, List<OrderItem> items, int roundNumber) {
        if (items == null || items.isEmpty()) {
            return null;
        }

        Outlet outlet = order.getOutlet();
        String kotNumber = generateKotNumber(outlet.getId());
        String serverName = order.getCreatedBy() != null ? order.getCreatedBy().getFullName() : "Server";

        // Determine primary station based on majority of items
        String primaryStation = determinePrimaryStation(items);

        Kot kot = new Kot(
                UUID.randomUUID().toString(),
                outlet,
                order,
                kotNumber,
                order.getTable(),
                serverName,
                order.getOrderType(),
                roundNumber,
                primaryStation,
                order.getNotes()
        );

        for (OrderItem orderItem : items) {
            String modifiersSummary = "";
            if (orderItem.getModifiers() != null && !orderItem.getModifiers().isEmpty()) {
                modifiersSummary = orderItem.getModifiers().stream()
                        .map(OrderItemModifier::getModifierName)
                        .collect(Collectors.joining(", "));
            }

            String itemStation = "MAIN_KITCHEN";
            if (orderItem.getMenuItem() != null && orderItem.getMenuItem().getCategory() != null) {
                itemStation = orderItem.getMenuItem().getCategory().getKitchenStation();
            }

            KotItem kotItem = new KotItem(
                    UUID.randomUUID().toString(),
                    kot,
                    orderItem,
                    orderItem.getMenuItem(),
                    orderItem.getItemName(),
                    orderItem.getQuantity(),
                    modifiersSummary,
                    itemStation,
                    orderItem.getNotes()
            );

            kot.addItem(kotItem);
        }

        Kot saved = kotRepository.save(kot);
        KotDto dto = mapToKotDto(saved);
        if (webSocketEventService != null) {
            webSocketEventService.publishKitchenEvent("KOT_CREATED", outlet.getId(), saved.getId(), dto);
        }
        return dto;
    }

    @Transactional(readOnly = true)
    public List<KotDto> getActiveKots(String outletId, String station) {
        List<Kot> kots;
        if (station != null && !station.isBlank() && !"ALL".equalsIgnoreCase(station)) {
            kots = kotRepository.findByOutletIdAndStationAndStatusInOrderByCreatedAtAsc(outletId, station.toUpperCase(), ACTIVE_STATUSES);
        } else {
            kots = kotRepository.findByOutletIdAndStatusInOrderByCreatedAtAsc(outletId, ACTIVE_STATUSES);
        }

        return kots.stream().map(this::mapToKotDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<KotDto> getKotsByOrderId(String orderId) {
        return kotRepository.findByOrderIdOrderByCreatedAtDesc(orderId)
                .stream()
                .map(this::mapToKotDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public KotDto getKotById(String id) {
        Kot kot = kotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kot", "id", id));
        return mapToKotDto(kot);
    }

    @Transactional
    public KotDto updateKotStatus(String kotId, KotStatus newStatus) {
        Kot kot = kotRepository.findById(kotId)
                .orElseThrow(() -> new ResourceNotFoundException("Kot", "id", kotId));

        if (kot.getStatus() == KotStatus.CANCELLED) {
            throw new BusinessException("Cannot modify cancelled KOT ticket");
        }

        kot.setStatus(newStatus);

        // Cascade item statuses based on ticket level advancement
        if (newStatus == KotStatus.PREPARING) {
            kot.getItems().forEach(item -> {
                if (item.getStatus() == OrderItemStatus.PENDING) {
                    item.setStatus(OrderItemStatus.PREPARING);
                }
            });
            // Also sync parent Order if order is NEW or ACCEPTED
            Order parentOrder = kot.getOrder();
            if (parentOrder != null && (parentOrder.getStatus() == OrderStatus.NEW || parentOrder.getStatus() == OrderStatus.ACCEPTED)) {
                parentOrder.setStatus(OrderStatus.PREPARING);
                orderRepository.save(parentOrder);
            }
        } else if (newStatus == KotStatus.READY) {
            kot.getItems().forEach(item -> item.setStatus(OrderItemStatus.READY));
            // Check if all KOTs for parent order are READY
            Order parentOrder = kot.getOrder();
            if (parentOrder != null && parentOrder.getStatus() != OrderStatus.COMPLETED && parentOrder.getStatus() != OrderStatus.CANCELLED) {
                List<Kot> allOrderKots = kotRepository.findByOrderId(parentOrder.getId());
                boolean allReady = allOrderKots.stream().allMatch(k -> k.getId().equals(kotId) ? true : (k.getStatus() == KotStatus.READY || k.getStatus() == KotStatus.SERVED));
                if (allReady) {
                    parentOrder.setStatus(OrderStatus.READY);
                    orderRepository.save(parentOrder);
                }
            }
        } else if (newStatus == KotStatus.SERVED) {
            kot.getItems().forEach(item -> item.setStatus(OrderItemStatus.SERVED));
            // Check if all KOTs for parent order are SERVED
            Order parentOrder = kot.getOrder();
            if (parentOrder != null && parentOrder.getStatus() != OrderStatus.COMPLETED && parentOrder.getStatus() != OrderStatus.CANCELLED) {
                List<Kot> allOrderKots = kotRepository.findByOrderId(parentOrder.getId());
                boolean allServed = allOrderKots.stream().allMatch(k -> k.getId().equals(kotId) ? true : (k.getStatus() == KotStatus.SERVED));
                if (allServed) {
                    parentOrder.setStatus(OrderStatus.SERVED);
                    orderRepository.save(parentOrder);
                }
            }
        }

        Kot saved = kotRepository.save(kot);
        KotDto dto = mapToKotDto(saved);
        if (webSocketEventService != null) {
            webSocketEventService.publishKitchenEvent("KOT_STATUS_CHANGED", saved.getOutlet().getId(), saved.getId(), dto);
        }
        return dto;
    }

    @Transactional
    public KotDto updateKotItemStatus(String kotItemId, OrderItemStatus status) {
        KotItem item = kotItemRepository.findById(kotItemId)
                .orElseThrow(() -> new ResourceNotFoundException("KotItem", "id", kotItemId));

        item.setStatus(status);
        kotItemRepository.save(item);

        // If all items in KOT are ready, automatically bump KOT to READY
        Kot parentKot = item.getKot();
        if (status == OrderItemStatus.READY) {
            boolean allItemsReady = parentKot.getItems().stream().allMatch(i -> i.getStatus() == OrderItemStatus.READY || i.getStatus() == OrderItemStatus.SERVED);
            if (allItemsReady && parentKot.getStatus() == KotStatus.PREPARING) {
                parentKot.setStatus(KotStatus.READY);
                kotRepository.save(parentKot);
            }
        }

        KotDto dto = mapToKotDto(parentKot);
        if (webSocketEventService != null) {
            webSocketEventService.publishKitchenEvent("ITEM_BUMPED", parentKot.getOutlet().getId(), item.getId(), dto);
        }
        return dto;
    }

    @Transactional
    public KotDto recallLastBumpedKot(String outletId) {
        List<Kot> bumpedKots = kotRepository.findRecentlyBumpedKots(
                outletId,
                List.of(KotStatus.READY, KotStatus.SERVED),
                PageRequest.of(0, 1)
        );

        if (bumpedKots.isEmpty()) {
            throw new BusinessException("No recently bumped tickets found to recall");
        }

        Kot lastBumped = bumpedKots.get(0);
        if (lastBumped.getStatus() == KotStatus.SERVED) {
            lastBumped.setStatus(KotStatus.READY);
        } else if (lastBumped.getStatus() == KotStatus.READY) {
            lastBumped.setStatus(KotStatus.PREPARING);
        }

        Kot saved = kotRepository.save(lastBumped);
        return mapToKotDto(saved);
    }

    @Transactional(readOnly = true)
    public KotStatsDto getKotStats(String outletId) {
        long totalToday = kotRepository.countTodayKots(outletId, LocalDate.now().atStartOfDay());
        long active = kotRepository.countByOutletIdAndStatusIn(outletId, ACTIVE_STATUSES);
        long preparing = kotRepository.countByOutletIdAndStatus(outletId, KotStatus.PREPARING);
        long ready = kotRepository.countByOutletIdAndStatus(outletId, KotStatus.READY);

        // Calculate delayed tickets (> 15 minutes)
        List<Kot> activeList = kotRepository.findByOutletIdAndStatusInOrderByCreatedAtAsc(outletId, ACTIVE_STATUSES);
        long delayed = activeList.stream()
                .filter(k -> k.getCreatedAt() != null && Duration.between(k.getCreatedAt(), LocalDateTime.now()).toMinutes() > 15)
                .count();

        return new KotStatsDto(totalToday, active, preparing, ready, delayed);
    }

    private String determinePrimaryStation(List<OrderItem> items) {
        for (OrderItem item : items) {
            if (item.getMenuItem() != null && item.getMenuItem().getCategory() != null) {
                String st = item.getMenuItem().getCategory().getKitchenStation();
                if ("PIZZA".equalsIgnoreCase(st) || "BAR".equalsIgnoreCase(st) || "DESSERT".equalsIgnoreCase(st)) {
                    return st.toUpperCase();
                }
            }
        }
        return "MAIN_KITCHEN";
    }

    private String generateKotNumber(String outletId) {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long todayCount = kotRepository.countTodayKots(outletId, LocalDate.now().atStartOfDay());
        return String.format("KOT-%s-%04d", datePart, todayCount + 1);
    }

    public KotDto mapToKotDto(Kot kot) {
        List<KotItemDto> itemDtos = kot.getItems().stream().map(item ->
                new KotItemDto(
                        item.getId(),
                        item.getMenuItem() != null ? item.getMenuItem().getId() : null,
                        item.getOrderItem() != null ? item.getOrderItem().getId() : null,
                        item.getItemName(),
                        item.getQuantity(),
                        item.getStatus(),
                        item.getModifiersSummary(),
                        item.getKitchenStation(),
                        item.getNotes(),
                        item.getCreatedAt()
                )
        ).collect(Collectors.toList());

        String tableId = null;
        String tableNumber = null;
        String floorName = null;
        if (kot.getTable() != null) {
            tableId = kot.getTable().getId();
            tableNumber = kot.getTable().getTableNumber();
            if (kot.getTable().getFloor() != null) {
                floorName = kot.getTable().getFloor().getName();
            }
        }

        String customerName = kot.getOrder() != null ? kot.getOrder().getCustomerName() : null;

        return new KotDto(
                kot.getId(),
                kot.getOutlet() != null ? kot.getOutlet().getId() : null,
                kot.getOrder().getId(),
                kot.getOrder().getOrderNumber(),
                kot.getKotNumber(),
                tableId,
                tableNumber,
                floorName,
                customerName,
                kot.getServerName(),
                kot.getOrderType(),
                kot.getRoundNumber(),
                kot.getStation(),
                kot.getStatus(),
                kot.getNotes(),
                itemDtos,
                kot.getCreatedAt(),
                kot.getUpdatedAt()
        );
    }
}
