package com.example.restaurant;

import com.example.restaurant.dto.auth.LoginRequest;
import com.example.restaurant.dto.kot.UpdateKotItemStatusRequest;
import com.example.restaurant.dto.kot.UpdateKotStatusRequest;
import com.example.restaurant.dto.menu.CreateCategoryRequest;
import com.example.restaurant.dto.menu.CreateMenuItemRequest;
import com.example.restaurant.dto.order.AddOrderItemsRequest;
import com.example.restaurant.dto.order.CreateOrderItemRequest;
import com.example.restaurant.dto.order.CreateOrderRequest;
import com.example.restaurant.entity.KotStatus;
import com.example.restaurant.entity.OrderItemStatus;
import com.example.restaurant.entity.OrderStatus;
import com.example.restaurant.entity.OrderType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class KotAndKdsIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String adminToken;
    private String cashierToken;
    private String kitchenToken;
    private String defaultOutletId;

    @BeforeEach
    void setUp() throws Exception {
        // Admin login
        LoginRequest adminLogin = new LoginRequest("admin", "Admin@123");
        MvcResult adminRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode adminData = objectMapper.readTree(adminRes.getResponse().getContentAsString()).path("data");
        adminToken = adminData.path("accessToken").asText();
        defaultOutletId = adminData.path("user").path("outletId").asText();

        // Cashier login
        LoginRequest cashierLogin = new LoginRequest("cashier", "Cashier@123");
        MvcResult cashierRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cashierLogin)))
                .andExpect(status().isOk())
                .andReturn();
        cashierToken = objectMapper.readTree(cashierRes.getResponse().getContentAsString()).path("data").path("accessToken").asText();

        // Kitchen login
        LoginRequest kitchenLogin = new LoginRequest("kitchen", "Kitchen@123");
        MvcResult kitchenRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(kitchenLogin)))
                .andExpect(status().isOk())
                .andReturn();
        kitchenToken = objectMapper.readTree(kitchenRes.getResponse().getContentAsString()).path("data").path("accessToken").asText();
    }

    @Test
    @DisplayName("Should automatically create KOT on order placement and display on KDS")
    void testKotAutoGenerationAndKdsDisplay() throws Exception {
        String menuItemId = getOrCreateMenuItemId("KDS Pizza", new BigDecimal("18.50"), "PIZZA");

        CreateOrderItemRequest itemReq = new CreateOrderItemRequest(menuItemId, 2, "Extra crispy base", List.of());
        CreateOrderRequest orderReq = new CreateOrderRequest(
                defaultOutletId, null, OrderType.TAKEAWAY, "Chef John", "+1-555-8899", 1,
                "Priority order", List.of(itemReq)
        );

        MvcResult orderRes = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + cashierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String orderId = objectMapper.readTree(orderRes.getResponse().getContentAsString()).path("data").path("id").asText();

        // Kitchen staff queries active KDS tickets
        MvcResult kdsRes = mockMvc.perform(get("/api/kds/tickets")
                        .param("outletId", defaultOutletId)
                        .header("Authorization", "Bearer " + kitchenToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", not(empty())))
                .andReturn();

        JsonNode tickets = objectMapper.readTree(kdsRes.getResponse().getContentAsString()).path("data");
        JsonNode matchingKot = null;
        for (JsonNode t : tickets) {
            if (orderId.equals(t.path("orderId").asText())) {
                matchingKot = t;
                break;
            }
        }

        org.junit.jupiter.api.Assertions.assertNotNull(matchingKot, "KOT ticket must be automatically created for order");
        org.junit.jupiter.api.Assertions.assertEquals("NEW", matchingKot.path("status").asText());
        org.junit.jupiter.api.Assertions.assertEquals(1, matchingKot.path("roundNumber").asInt());
        org.junit.jupiter.api.Assertions.assertTrue(matchingKot.path("kotNumber").asText().startsWith("KOT-"));
        org.junit.jupiter.api.Assertions.assertEquals("Extra crispy base", matchingKot.path("items").get(0).path("notes").asText());
    }

    @Test
    @DisplayName("Should generate Round 2 KOT when additional items are added to an existing order")
    void testAddItemsGeneratesRoundTwoKot() throws Exception {
        String item1 = getOrCreateMenuItemId("Burger", new BigDecimal("12.00"), "MAIN_KITCHEN");
        String item2 = getOrCreateMenuItemId("Fries", new BigDecimal("5.00"), "MAIN_KITCHEN");

        // 1. Create initial order
        CreateOrderRequest orderReq = new CreateOrderRequest(
                defaultOutletId, null, OrderType.TAKEAWAY, "Multi Round Guest", null, 1,
                null, List.of(new CreateOrderItemRequest(item1, 1, null, List.of()))
        );
        MvcResult orderRes = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + cashierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isCreated())
                .andReturn();
        String orderId = objectMapper.readTree(orderRes.getResponse().getContentAsString()).path("data").path("id").asText();

        // 2. Add second item
        AddOrderItemsRequest addReq = new AddOrderItemsRequest(
                List.of(new CreateOrderItemRequest(item2, 2, "Hot and salted", List.of()))
        );
        mockMvc.perform(post("/api/orders/" + orderId + "/items")
                        .header("Authorization", "Bearer " + cashierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addReq)))
                .andExpect(status().isOk());

        // 3. Query all KOT tickets for this order
        MvcResult orderKotsRes = mockMvc.perform(get("/api/kds/order/" + orderId)
                        .header("Authorization", "Bearer " + kitchenToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andReturn();

        JsonNode kots = objectMapper.readTree(orderKotsRes.getResponse().getContentAsString()).path("data");
        // Check rounds (1 and 2)
        int roundFirst = kots.get(0).path("roundNumber").asInt();
        int roundSecond = kots.get(1).path("roundNumber").asInt();
        org.junit.jupiter.api.Assertions.assertTrue(
                (roundFirst == 2 && roundSecond == 1) || (roundFirst == 1 && roundSecond == 2),
                "Order should have round 1 and round 2 KOT tickets"
        );
    }

    @Test
    @DisplayName("Should execute bump bar lifecycle (NEW -> PREPARING -> READY -> SERVED) and sync parent order")
    void testBumpBarLifecycleAndOrderSync() throws Exception {
        String item = getOrCreateMenuItemId("Pasta Carbonara", new BigDecimal("16.00"), "MAIN_KITCHEN");

        CreateOrderRequest orderReq = new CreateOrderRequest(
                defaultOutletId, null, OrderType.TAKEAWAY, "Bump Guest", null, 1,
                null, List.of(new CreateOrderItemRequest(item, 1, null, List.of()))
        );
        MvcResult orderRes = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + cashierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isCreated())
                .andReturn();
        String orderId = objectMapper.readTree(orderRes.getResponse().getContentAsString()).path("data").path("id").asText();

        // Fetch KOT ticket
        MvcResult kotsRes = mockMvc.perform(get("/api/kds/order/" + orderId)
                        .header("Authorization", "Bearer " + kitchenToken))
                .andExpect(status().isOk())
                .andReturn();
        String kotId = objectMapper.readTree(kotsRes.getResponse().getContentAsString()).path("data").get(0).path("id").asText();

        // 1. Bump to PREPARING
        mockMvc.perform(patch("/api/kds/tickets/" + kotId + "/status")
                        .header("Authorization", "Bearer " + kitchenToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateKotStatusRequest(KotStatus.PREPARING, null))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PREPARING"))
                .andExpect(jsonPath("$.data.items[0].status").value("PREPARING"));

        // Verify parent order automatically transitioned to PREPARING
        mockMvc.perform(get("/api/orders/" + orderId)
                        .header("Authorization", "Bearer " + cashierToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PREPARING"));

        // 2. Bump to READY
        mockMvc.perform(patch("/api/kds/tickets/" + kotId + "/status")
                        .header("Authorization", "Bearer " + kitchenToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateKotStatusRequest(KotStatus.READY, null))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("READY"))
                .andExpect(jsonPath("$.data.items[0].status").value("READY"));

        // Verify parent order automatically transitioned to READY
        mockMvc.perform(get("/api/orders/" + orderId)
                        .header("Authorization", "Bearer " + cashierToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("READY"));

        // 3. Bump to SERVED
        mockMvc.perform(patch("/api/kds/tickets/" + kotId + "/status")
                        .header("Authorization", "Bearer " + kitchenToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateKotStatusRequest(KotStatus.SERVED, null))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("SERVED"));

        // 4. Verify Recall restores ticket to READY
        mockMvc.perform(post("/api/kds/recall")
                        .param("outletId", defaultOutletId)
                        .header("Authorization", "Bearer " + kitchenToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(kotId))
                .andExpect(jsonPath("$.data.status").value("READY"));
    }

    @Test
    @DisplayName("Should update individual item plating status")
    void testIndividualItemStatusUpdate() throws Exception {
        String item = getOrCreateMenuItemId("Plating Steak", new BigDecimal("25.00"), "MAIN_KITCHEN");

        CreateOrderRequest orderReq = new CreateOrderRequest(
                defaultOutletId, null, OrderType.TAKEAWAY, "Item Plating Guest", null, 1,
                null, List.of(new CreateOrderItemRequest(item, 1, null, List.of()))
        );
        MvcResult orderRes = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + cashierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isCreated())
                .andReturn();
        String orderId = objectMapper.readTree(orderRes.getResponse().getContentAsString()).path("data").path("id").asText();

        MvcResult kotsRes = mockMvc.perform(get("/api/kds/order/" + orderId)
                        .header("Authorization", "Bearer " + kitchenToken))
                .andExpect(status().isOk())
                .andReturn();
        String kotItemId = objectMapper.readTree(kotsRes.getResponse().getContentAsString())
                .path("data").get(0).path("items").get(0).path("id").asText();

        // Update single item to READY
        mockMvc.perform(patch("/api/kds/items/" + kotItemId + "/status")
                        .header("Authorization", "Bearer " + kitchenToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateKotItemStatusRequest(OrderItemStatus.READY))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items[0].status").value("READY"));
    }

    @Test
    @DisplayName("Should return kitchen stats metrics")
    void testKitchenStats() throws Exception {
        mockMvc.perform(get("/api/kds/stats")
                        .param("outletId", defaultOutletId)
                        .header("Authorization", "Bearer " + kitchenToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalToday").isNumber())
                .andExpect(jsonPath("$.data.activeTickets").isNumber())
                .andExpect(jsonPath("$.data.preparingTickets").isNumber())
                .andExpect(jsonPath("$.data.readyTickets").isNumber())
                .andExpect(jsonPath("$.data.delayedTickets").isNumber());
    }

    // Helpers
    private String getOrCreateMenuItemId(String name, BigDecimal price, String kitchenStation) throws Exception {
        MvcResult catRes = mockMvc.perform(get("/api/menu/categories").param("outletId", defaultOutletId)
                        .header("Authorization", "Bearer " + adminToken))
                .andReturn();
        JsonNode catData = objectMapper.readTree(catRes.getResponse().getContentAsString()).path("data");
        String categoryId;
        if (catData.isArray() && catData.size() > 0) {
            categoryId = catData.get(0).path("id").asText();
        } else {
            CreateCategoryRequest createCat = new CreateCategoryRequest(defaultOutletId, "Cat " + System.currentTimeMillis(), "Desc", 1, true);
            createCat.setKitchenStation(kitchenStation != null ? kitchenStation : "MAIN_KITCHEN");
            MvcResult createdCat = mockMvc.perform(post("/api/menu/categories")
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(createCat)))
                    .andReturn();
            categoryId = objectMapper.readTree(createdCat.getResponse().getContentAsString()).path("data").path("id").asText();
        }

        CreateMenuItemRequest itemReq = new CreateMenuItemRequest(
                categoryId, name + " " + (System.currentTimeMillis() % 10000),
                "Tasty item", price, price.multiply(new BigDecimal("0.35")), new BigDecimal("5.00"),
                null, true, 12, null, java.util.Set.of()
        );
        MvcResult itemRes = mockMvc.perform(post("/api/menu/items")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(itemReq)))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(itemRes.getResponse().getContentAsString()).path("data").path("id").asText();
    }
}
