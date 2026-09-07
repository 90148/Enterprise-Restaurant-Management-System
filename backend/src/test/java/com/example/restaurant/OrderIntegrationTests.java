package com.example.restaurant;

import com.example.restaurant.dto.auth.LoginRequest;
import com.example.restaurant.dto.menu.CreateCategoryRequest;
import com.example.restaurant.dto.menu.CreateMenuItemRequest;
import com.example.restaurant.dto.order.*;
import com.example.restaurant.dto.table.CreateTableRequest;
import com.example.restaurant.entity.OrderStatus;
import com.example.restaurant.entity.OrderType;
import com.example.restaurant.entity.TableShape;
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
class OrderIntegrationTests {

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
    @DisplayName("Should create dine-in order, automatically occupy table, and calculate financials correctly")
    void testCreateDineInOrderAndTableStatusTransition() throws Exception {
        // 1. Get or create a test floor and table
        String floorId = getOrCreateFloorId();
        String tableNumber = "T-ORD-" + System.currentTimeMillis() % 10000;
        CreateTableRequest tableReq = new CreateTableRequest(floorId, tableNumber, 4, TableShape.SQUARE, 10, 10);
        MvcResult tableRes = mockMvc.perform(post("/api/tables")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(tableReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("AVAILABLE"))
                .andReturn();
        String tableId = objectMapper.readTree(tableRes.getResponse().getContentAsString()).path("data").path("id").asText();

        // 2. Get an available menu item
        String menuItemId = getOrCreateMenuItemId("Special Pasta", new BigDecimal("14.00"), true);

        // 3. Place Dine-In Order as Cashier
        CreateOrderItemRequest itemReq = new CreateOrderItemRequest(menuItemId, 2, "Less spicy", List.of());
        CreateOrderRequest orderReq = new CreateOrderRequest(
                defaultOutletId,
                tableId,
                OrderType.DINE_IN,
                "Alice Johnson",
                "+1-555-0199",
                2,
                "Window seat requested",
                List.of(itemReq)
        );

        MvcResult orderRes = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + cashierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.orderNumber", startsWith("ORD-")))
                .andExpect(jsonPath("$.data.status").value("NEW"))
                .andExpect(jsonPath("$.data.orderType").value("DINE_IN"))
                .andExpect(jsonPath("$.data.tableNumber").value(tableNumber))
                .andExpect(jsonPath("$.data.items", hasSize(1)))
                .andExpect(jsonPath("$.data.subtotal").value(28.00)) // 14.00 * 2
                .andReturn();

        String orderId = objectMapper.readTree(orderRes.getResponse().getContentAsString()).path("data").path("id").asText();

        // 4. Verify table status has transitioned to OCCUPIED
        mockMvc.perform(get("/api/tables/" + tableId)
                        .header("Authorization", "Bearer " + cashierToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("OCCUPIED"));

        // 5. Verify active order can be retrieved by table
        mockMvc.perform(get("/api/orders/table/" + tableId + "/active")
                        .param("outletId", defaultOutletId)
                        .header("Authorization", "Bearer " + cashierToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(orderId))
                .andExpect(jsonPath("$.data.customerName").value("Alice Johnson"));
    }

    @Test
    @DisplayName("Should append items to running tab on dining table and update financial totals")
    void testAppendItemsToRunningTab() throws Exception {
        String floorId = getOrCreateFloorId();
        String tableNumber = "T-TAB-" + System.currentTimeMillis() % 10000;
        CreateTableRequest tableReq = new CreateTableRequest(floorId, tableNumber, 4, TableShape.SQUARE, 20, 20);
        MvcResult tableRes = mockMvc.perform(post("/api/tables")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(tableReq)))
                .andExpect(status().isCreated())
                .andReturn();
        String tableId = objectMapper.readTree(tableRes.getResponse().getContentAsString()).path("data").path("id").asText();

        String menuItem1Id = getOrCreateMenuItemId("Starter Wings", new BigDecimal("10.00"), true);
        String menuItem2Id = getOrCreateMenuItemId("Garlic Bread", new BigDecimal("6.00"), true);

        // Place initial order
        CreateOrderRequest orderReq = new CreateOrderRequest(
                defaultOutletId, tableId, OrderType.DINE_IN, "Tab Customer", null, 2, null,
                List.of(new CreateOrderItemRequest(menuItem1Id, 1, null, List.of()))
        );
        MvcResult orderRes = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + cashierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.subtotal").value(10.00))
                .andReturn();
        String orderId = objectMapper.readTree(orderRes.getResponse().getContentAsString()).path("data").path("id").asText();

        // Append second round of items (Garlic Bread x 2)
        AddOrderItemsRequest addReq = new AddOrderItemsRequest(
                List.of(new CreateOrderItemRequest(menuItem2Id, 2, "Extra crispy", List.of()))
        );
        mockMvc.perform(post("/api/orders/" + orderId + "/items")
                        .header("Authorization", "Bearer " + cashierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items", hasSize(2)))
                .andExpect(jsonPath("$.data.subtotal").value(22.00)) // 10.00 + (6.00 * 2) = 22.00
                .andExpect(jsonPath("$.data.itemCount").value(3)); // 1 + 2 = 3 items total
    }

    @Test
    @DisplayName("Should apply discount, progress status lifecycle, and release table upon cancellation")
    void testOrderStatusLifecycleAndCancellation() throws Exception {
        String floorId = getOrCreateFloorId();
        String tableNumber = "T-CAN-" + System.currentTimeMillis() % 10000;
        CreateTableRequest tableReq = new CreateTableRequest(floorId, tableNumber, 2, TableShape.ROUND, 30, 30);
        MvcResult tableRes = mockMvc.perform(post("/api/tables")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(tableReq)))
                .andExpect(status().isCreated())
                .andReturn();
        String tableId = objectMapper.readTree(tableRes.getResponse().getContentAsString()).path("data").path("id").asText();

        String menuItemId = getOrCreateMenuItemId("Gourmet Burger", new BigDecimal("20.00"), true);

        // Place order
        CreateOrderRequest orderReq = new CreateOrderRequest(
                defaultOutletId, tableId, OrderType.DINE_IN, "Cancel Test", null, 1, null,
                List.of(new CreateOrderItemRequest(menuItemId, 1, null, List.of()))
        );
        MvcResult orderRes = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + cashierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isCreated())
                .andReturn();
        String orderId = objectMapper.readTree(orderRes.getResponse().getContentAsString()).path("data").path("id").asText();

        // 1. Apply 10% discount
        ApplyDiscountRequest discountReq = new ApplyDiscountRequest("PERCENTAGE", new BigDecimal("10.00"), "Happy Hour");
        mockMvc.perform(post("/api/orders/" + orderId + "/discount")
                        .header("Authorization", "Bearer " + cashierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(discountReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.discountAmount").value(2.00)); // 10% of 20.00

        // 2. Advance lifecycle: NEW -> ACCEPTED -> PREPARING -> READY -> SERVED
        OrderStatus[] flow = {OrderStatus.ACCEPTED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.SERVED};
        for (OrderStatus nextStatus : flow) {
            UpdateOrderStatusRequest statusReq = new UpdateOrderStatusRequest(nextStatus, "Kitchen workflow step");
            mockMvc.perform(patch("/api/orders/" + orderId + "/status")
                            .header("Authorization", "Bearer " + cashierToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(statusReq)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.status").value(nextStatus.name()));
        }

        // 3. Cancel order and verify table is released back to AVAILABLE
        mockMvc.perform(post("/api/orders/" + orderId + "/cancel")
                        .header("Authorization", "Bearer " + cashierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"reason\": \"Guest had emergency\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CANCELLED"));

        // Table should now be AVAILABLE
        mockMvc.perform(get("/api/tables/" + tableId)
                        .header("Authorization", "Bearer " + cashierToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("AVAILABLE"));
    }

    @Test
    @DisplayName("Should reject placing an order with an unavailable / 86'd menu item")
    void test86ListRejection() throws Exception {
        String floorId = getOrCreateFloorId();
        String tableNumber = "T-86-" + System.currentTimeMillis() % 10000;
        CreateTableRequest tableReq = new CreateTableRequest(floorId, tableNumber, 2, TableShape.SQUARE, 40, 40);
        MvcResult tableRes = mockMvc.perform(post("/api/tables")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(tableReq)))
                .andExpect(status().isCreated())
                .andReturn();
        String tableId = objectMapper.readTree(tableRes.getResponse().getContentAsString()).path("data").path("id").asText();

        // Create item marked unavailable (86'd)
        String soldOutItemId = getOrCreateMenuItemId("Sold Out Seafood", new BigDecimal("25.00"), false);

        CreateOrderRequest orderReq = new CreateOrderRequest(
                defaultOutletId, tableId, OrderType.DINE_IN, "Guest", null, 1, null,
                List.of(new CreateOrderItemRequest(soldOutItemId, 1, null, List.of()))
        );

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + cashierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("sold out / marked 86")));
    }

    @Test
    @DisplayName("Should create takeaway order without requiring table")
    void testTakeawayOrderCreation() throws Exception {
        String menuItemId = getOrCreateMenuItemId("Takeaway Combo", new BigDecimal("18.50"), true);

        CreateOrderRequest takeawayReq = new CreateOrderRequest(
                defaultOutletId,
                null, // No table
                OrderType.TAKEAWAY,
                "Robert Brown",
                "+1-555-0987",
                1,
                "Pack cutlery",
                List.of(new CreateOrderItemRequest(menuItemId, 1, null, List.of()))
        );

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + cashierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(takeawayReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.orderType").value("TAKEAWAY"))
                .andExpect(jsonPath("$.data.tableId").doesNotExist())
                .andExpect(jsonPath("$.data.customerName").value("Robert Brown"));
    }

    @Test
    @DisplayName("Should enforce RBAC on order management endpoints")
    void testRbacOrderSecurity() throws Exception {
        // 1. Unauthenticated request without JWT returns 403 Forbidden
        mockMvc.perform(get("/api/orders").param("outletId", defaultOutletId))
                .andExpect(status().isForbidden());

        // 2. Kitchen role has ORDER_VIEW but lacks ORDER_CREATE
        CreateOrderRequest orderReq = new CreateOrderRequest(
                defaultOutletId, null, OrderType.TAKEAWAY, "Staff", null, 1, null,
                List.of(new CreateOrderItemRequest("item-id", 1, null, List.of()))
        );

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + kitchenToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isForbidden());
    }

    // Helper methods
    private String getOrCreateFloorId() throws Exception {
        MvcResult res = mockMvc.perform(get("/api/floors").param("outletId", defaultOutletId)
                        .header("Authorization", "Bearer " + adminToken))
                .andReturn();
        JsonNode data = objectMapper.readTree(res.getResponse().getContentAsString()).path("data");
        if (data.isArray() && data.size() > 0) {
            return data.get(0).path("id").asText();
        }
        return "floor-main";
    }

    private String getOrCreateMenuItemId(String name, BigDecimal price, boolean isAvailable) throws Exception {
        // Get category
        MvcResult catRes = mockMvc.perform(get("/api/menu/categories").param("outletId", defaultOutletId)
                        .header("Authorization", "Bearer " + adminToken))
                .andReturn();
        JsonNode catData = objectMapper.readTree(catRes.getResponse().getContentAsString()).path("data");
        String categoryId;
        if (catData.isArray() && catData.size() > 0) {
            categoryId = catData.get(0).path("id").asText();
        } else {
            CreateCategoryRequest createCat = new CreateCategoryRequest(defaultOutletId, "Test Cat " + System.currentTimeMillis(), "Desc", 1, true);
            MvcResult createdCat = mockMvc.perform(post("/api/menu/categories")
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(createCat)))
                    .andReturn();
            categoryId = objectMapper.readTree(createdCat.getResponse().getContentAsString()).path("data").path("id").asText();
        }

        CreateMenuItemRequest itemReq = new CreateMenuItemRequest(
                categoryId, name + " " + (System.currentTimeMillis() % 10000),
                "Delicious dish", price, price.multiply(new BigDecimal("0.4")), new BigDecimal("5.00"),
                null, true, 15, null, java.util.Set.of()
        );
        MvcResult itemRes = mockMvc.perform(post("/api/menu/items")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(itemReq)))
                .andExpect(status().isCreated())
                .andReturn();
        String itemId = objectMapper.readTree(itemRes.getResponse().getContentAsString()).path("data").path("id").asText();

        if (!isAvailable) {
            mockMvc.perform(patch("/api/menu/items/" + itemId + "/availability")
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"isAvailable\": false}"))
                    .andExpect(status().isOk());
        }

        return itemId;
    }
}
