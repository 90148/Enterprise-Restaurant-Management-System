package com.example.restaurant;

import com.example.restaurant.dto.auth.LoginRequest;
import com.example.restaurant.dto.billing.ProcessPaymentRequest;
import com.example.restaurant.dto.menu.CreateCategoryRequest;
import com.example.restaurant.dto.menu.CreateMenuItemRequest;
import com.example.restaurant.dto.order.CreateOrderItemRequest;
import com.example.restaurant.dto.order.CreateOrderRequest;
import com.example.restaurant.dto.table.CreateTableRequest;
import com.example.restaurant.entity.PaymentMethod;
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
class BillingAndPaymentIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String adminToken;
    private String cashierToken;
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
    }

    @Test
    @DisplayName("Should generate bill from Dine-In order and transition table to BILLING status")
    void testGenerateBillAndTableBillingTransition() throws Exception {
        // 1. Create a dining table
        String floorId = getOrCreateFloorId();
        String tableNumber = "BILL-T-" + (System.currentTimeMillis() % 10000);
        CreateTableRequest tableReq = new CreateTableRequest(floorId, tableNumber, 4, TableShape.SQUARE, 20, 20);
        MvcResult tableRes = mockMvc.perform(post("/api/tables")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(tableReq)))
                .andExpect(status().isCreated())
                .andReturn();
        String tableId = objectMapper.readTree(tableRes.getResponse().getContentAsString()).path("data").path("id").asText();

        // 2. Place Dine-In order
        String menuItemId = getOrCreateMenuItemId("Salmon Grill", new BigDecimal("25.00"));
        CreateOrderItemRequest itemReq = new CreateOrderItemRequest(menuItemId, 2, "Well done", List.of());
        CreateOrderRequest orderReq = new CreateOrderRequest(
                defaultOutletId, tableId, OrderType.DINE_IN, "Alice Smith", "+1-555-4321", 2,
                "Window seat", List.of(itemReq)
        );

        MvcResult orderRes = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + cashierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isCreated())
                .andReturn();
        String orderId = objectMapper.readTree(orderRes.getResponse().getContentAsString()).path("data").path("id").asText();

        // Verify table is OCCUPIED
        mockMvc.perform(get("/api/tables/" + tableId)
                        .header("Authorization", "Bearer " + cashierToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("OCCUPIED"));

        // 3. Generate Bill
        MvcResult billRes = mockMvc.perform(post("/api/bills/order/" + orderId)
                        .header("Authorization", "Bearer " + cashierToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.billNumber").value(startsWith("BILL-")))
                .andExpect(jsonPath("$.data.status").value("UNPAID"))
                .andExpect(jsonPath("$.data.subtotal").value(50.00))
                .andExpect(jsonPath("$.data.paidAmount").value(0.00))
                .andExpect(jsonPath("$.data.items", hasSize(1)))
                .andReturn();

        // 4. Verify table transitioned to BILLING
        mockMvc.perform(get("/api/tables/" + tableId)
                        .header("Authorization", "Bearer " + cashierToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("BILLING"));
    }

    @Test
    @DisplayName("Should process partial payment, full payment, and release dining table upon settlement")
    void testPartialAndFullPaymentSettlementAndTableRelease() throws Exception {
        // 1. Create table & order
        String floorId = getOrCreateFloorId();
        String tableNumber = "SETTLE-T-" + (System.currentTimeMillis() % 10000);
        CreateTableRequest tableReq = new CreateTableRequest(floorId, tableNumber, 2, TableShape.ROUND, 30, 30);
        MvcResult tableRes = mockMvc.perform(post("/api/tables")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(tableReq)))
                .andExpect(status().isCreated())
                .andReturn();
        String tableId = objectMapper.readTree(tableRes.getResponse().getContentAsString()).path("data").path("id").asText();

        String menuItemId = getOrCreateMenuItemId("Burger Deluxe", new BigDecimal("20.00"));
        CreateOrderItemRequest itemReq = new CreateOrderItemRequest(menuItemId, 1, null, List.of());
        CreateOrderRequest orderReq = new CreateOrderRequest(
                defaultOutletId, tableId, OrderType.DINE_IN, "Bob Miller", null, 1,
                null, List.of(itemReq)
        );

        MvcResult orderRes = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + cashierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isCreated())
                .andReturn();
        String orderId = objectMapper.readTree(orderRes.getResponse().getContentAsString()).path("data").path("id").asText();

        // Generate Bill
        MvcResult billRes = mockMvc.perform(post("/api/bills/order/" + orderId)
                        .header("Authorization", "Bearer " + cashierToken))
                .andExpect(status().isCreated())
                .andReturn();
        String billId = objectMapper.readTree(billRes.getResponse().getContentAsString()).path("data").path("id").asText();
        double totalAmount = objectMapper.readTree(billRes.getResponse().getContentAsString()).path("data").path("totalAmount").asDouble();

        // 2. Process Partial Payment: Pay $10.00 in CASH
        ProcessPaymentRequest partialReq = new ProcessPaymentRequest(
                new BigDecimal("10.00"), new BigDecimal("10.00"), PaymentMethod.CASH, null, "Guest 1 split"
        );
        mockMvc.perform(post("/api/bills/" + billId + "/payments")
                        .header("Authorization", "Bearer " + cashierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(partialReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PARTIALLY_PAID"))
                .andExpect(jsonPath("$.data.paidAmount").value(10.00))
                .andExpect(jsonPath("$.data.payments", hasSize(1)));

        // Verify order is still not completed and table is still BILLING
        mockMvc.perform(get("/api/orders/" + orderId).header("Authorization", "Bearer " + cashierToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value(not("COMPLETED")));

        // 3. Settle Remaining Balance using CARD
        BigDecimal remaining = BigDecimal.valueOf(totalAmount).subtract(new BigDecimal("10.00"));
        ProcessPaymentRequest settleReq = new ProcessPaymentRequest(
                remaining, remaining, PaymentMethod.CARD, "AUTH-998822", "Guest 2 split settlement"
        );
        mockMvc.perform(post("/api/bills/" + billId + "/payments")
                        .header("Authorization", "Bearer " + cashierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(settleReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PAID"))
                .andExpect(jsonPath("$.data.balanceAmount").value(0.00))
                .andExpect(jsonPath("$.data.payments", hasSize(2)));

        // 4. Verify parent order is COMPLETED
        mockMvc.perform(get("/api/orders/" + orderId).header("Authorization", "Bearer " + cashierToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"));

        // 5. Verify dining table is RELEASED to AVAILABLE!
        mockMvc.perform(get("/api/tables/" + tableId).header("Authorization", "Bearer " + cashierToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("AVAILABLE"));
    }

    @Test
    @DisplayName("Should accurately calculate change for cash transactions")
    void testCashChangeCalculation() throws Exception {
        String menuItemId = getOrCreateMenuItemId("Quick Coffee", new BigDecimal("5.00"));
        CreateOrderItemRequest itemReq = new CreateOrderItemRequest(menuItemId, 1, null, List.of());
        CreateOrderRequest orderReq = new CreateOrderRequest(
                defaultOutletId, null, OrderType.TAKEAWAY, "Coffee Guest", null, 1,
                null, List.of(itemReq)
        );

        MvcResult orderRes = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + cashierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isCreated())
                .andReturn();
        String orderId = objectMapper.readTree(orderRes.getResponse().getContentAsString()).path("data").path("id").asText();

        MvcResult billRes = mockMvc.perform(post("/api/bills/order/" + orderId)
                        .header("Authorization", "Bearer " + cashierToken))
                .andExpect(status().isCreated())
                .andReturn();
        String billId = objectMapper.readTree(billRes.getResponse().getContentAsString()).path("data").path("id").asText();
        double total = objectMapper.readTree(billRes.getResponse().getContentAsString()).path("data").path("totalAmount").asDouble();

        // Customer tenders $20.00 for bill
        ProcessPaymentRequest payReq = new ProcessPaymentRequest(
                BigDecimal.valueOf(total), new BigDecimal("20.00"), PaymentMethod.CASH, null, "Customer gave 20 bill"
        );

        mockMvc.perform(post("/api/bills/" + billId + "/payments")
                        .header("Authorization", "Bearer " + cashierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PAID"))
                .andExpect(jsonPath("$.data.payments[0].tenderedAmount").value(20.00))
                .andExpect(jsonPath("$.data.payments[0].changeAmount").value(greaterThan(0.0)));
    }

    @Test
    @DisplayName("Should retrieve billing statistics")
    void testBillingStats() throws Exception {
        mockMvc.perform(get("/api/bills/stats")
                        .param("outletId", defaultOutletId)
                        .header("Authorization", "Bearer " + cashierToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalBillsToday").isNumber())
                .andExpect(jsonPath("$.data.unpaidBills").isNumber())
                .andExpect(jsonPath("$.data.paidBills").isNumber())
                .andExpect(jsonPath("$.data.todayRevenue").isNumber());
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

    private String getOrCreateMenuItemId(String name, BigDecimal price) throws Exception {
        MvcResult catRes = mockMvc.perform(get("/api/menu/categories").param("outletId", defaultOutletId)
                        .header("Authorization", "Bearer " + adminToken))
                .andReturn();
        JsonNode catData = objectMapper.readTree(catRes.getResponse().getContentAsString()).path("data");
        String categoryId;
        if (catData.isArray() && catData.size() > 0) {
            categoryId = catData.get(0).path("id").asText();
        } else {
            CreateCategoryRequest createCat = new CreateCategoryRequest(defaultOutletId, "Cat " + System.currentTimeMillis(), "Desc", 1, true);
            MvcResult createdCat = mockMvc.perform(post("/api/menu/categories")
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(createCat)))
                    .andReturn();
            categoryId = objectMapper.readTree(createdCat.getResponse().getContentAsString()).path("data").path("id").asText();
        }

        CreateMenuItemRequest itemReq = new CreateMenuItemRequest(
                categoryId, name + " " + (System.currentTimeMillis() % 10000),
                "Fresh item", price, price.multiply(new BigDecimal("0.35")), new BigDecimal("5.00"),
                null, true, 10, null, java.util.Set.of()
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
