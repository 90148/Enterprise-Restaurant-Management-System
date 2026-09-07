package com.example.restaurant.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class WebSocketEventService {

    private static final Logger log = LoggerFactory.getLogger(WebSocketEventService.class);

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketEventService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void publishOrderEvent(String eventType, String outletId, String orderId, Object data) {
        publishEvent("/topic/orders", eventType, outletId, orderId, data);
    }

    public void publishKitchenEvent(String eventType, String outletId, String kotId, Object data) {
        publishEvent("/topic/kitchen", eventType, outletId, kotId, data);
    }

    public void publishTableEvent(String eventType, String outletId, String tableId, Object data) {
        publishEvent("/topic/tables", eventType, outletId, tableId, data);
    }

    public void publishBillingEvent(String eventType, String outletId, String billId, Object data) {
        publishEvent("/topic/billing", eventType, outletId, billId, data);
    }

    private void publishEvent(String destination, String eventType, String outletId, String entityId, Object data) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("eventType", eventType);
            payload.put("outletId", outletId);
            payload.put("entityId", entityId);
            payload.put("data", data);
            payload.put("timestamp", LocalDateTime.now().toString());

            messagingTemplate.convertAndSend(destination, payload);
            log.debug("Published WebSocket event {} to destination {}", eventType, destination);
        } catch (Exception e) {
            log.warn("Failed to publish WebSocket event to {}: {}", destination, e.getMessage());
        }
    }
}
