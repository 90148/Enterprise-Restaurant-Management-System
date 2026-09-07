package com.example.restaurant;

import com.example.restaurant.dto.auth.LoginRequest;
import com.example.restaurant.dto.billing.ProcessPaymentRequest;
import com.example.restaurant.dto.menu.CreateCategoryRequest;
import com.example.restaurant.dto.menu.CreateMenuItemRequest;
import com.example.restaurant.dto.order.CreateOrderItemRequest;
import com.example.restaurant.dto.order.CreateOrderRequest;
import com.example.restaurant.dto.setting.OutletSettingsDto;
import com.example.restaurant.dto.setting.TaxDto;
import com.example.restaurant.entity.OrderType;
import com.example.restaurant.entity.PaymentMethod;
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
class ReportAndAnalyticsIntegrationTests {

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
    @DisplayName("Should fetch real-time live operational metrics for Dashboard")
    void testDashboardStatsAggregation() throws Exception {
        mockMvc.perform(get("/api/reports/dashboard/stats")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("outletId", defaultOutletId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.todayRevenue").exists())
                .andExpect(jsonPath("$.data.totalTables").isNumber())
                .andExpect(jsonPath("$.data.activeTables").isNumber())
                .andExpect(jsonPath("$.data.availableTables").isNumber())
                .andExpect(jsonPath("$.data.hourlyTrend", hasSize(24)))
                .andExpect(jsonPath("$.data.lowStockAlerts").isArray());
    }

    @Test
    @DisplayName("Should aggregate sales summary and daily revenue breakdown")
    void testSalesSummaryAndDailyTrends() throws Exception {
        // 1. Create a category & menu item
        String categoryId = createCategory("Report Test Category " + System.currentTimeMillis());
        String itemId = createMenuItem(categoryId, "Analytics Special Dish " + System.currentTimeMillis(), new BigDecimal("45.00"));

        // 2. Create an order
        CreateOrderItemRequest itemReq = new CreateOrderItemRequest(itemId, 2, "Spicy", List.of());
        CreateOrderRequest orderReq = new CreateOrderRequest(
                defaultOutletId,
                null,
                OrderType.TAKEAWAY,
                "Report Customer",
                "9876543210",
                1,
                "Testing sales analytics",
                List.of(itemReq)
        );

        MvcResult orderRes = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + cashierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isCreated())
                .andReturn();
        String orderId = objectMapper.readTree(orderRes.getResponse().getContentAsString()).path("data").path("id").asText();

        // 3. Generate bill & settle payment
        MvcResult billRes = mockMvc.perform(post("/api/bills/order/" + orderId)
                        .header("Authorization", "Bearer " + cashierToken))
                .andExpect(status().isCreated())
                .andReturn();
        String billId = objectMapper.readTree(billRes.getResponse().getContentAsString()).path("data").path("id").asText();
        BigDecimal totalAmount = new BigDecimal(objectMapper.readTree(billRes.getResponse().getContentAsString()).path("data").path("totalAmount").asText());

        ProcessPaymentRequest payReq = new ProcessPaymentRequest(
                totalAmount,
                totalAmount,
                PaymentMethod.UPI,
                "UPI-REPORT-123",
                "Settled for analytics test"
        );
        mockMvc.perform(post("/api/bills/" + billId + "/payments")
                        .header("Authorization", "Bearer " + cashierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payReq)))
                .andExpect(status().isOk());

        // 4. Verify sales summary reflects the paid transaction
        mockMvc.perform(get("/api/reports/sales/summary")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("outletId", defaultOutletId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.grossSales", greaterThanOrEqualTo(0.0)))
                .andExpect(jsonPath("$.data.totalPaid", greaterThan(0.0)))
                .andExpect(jsonPath("$.data.totalBills", greaterThanOrEqualTo(1)));

        // 5. Verify daily sales returns array
        mockMvc.perform(get("/api/reports/sales/daily")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("outletId", defaultOutletId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("Should retrieve payment method and order type breakdowns")
    void testPaymentMethodAndOrderTypeBreakdowns() throws Exception {
        mockMvc.perform(get("/api/reports/sales/payment-methods")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("outletId", defaultOutletId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());

        mockMvc.perform(get("/api/reports/sales/order-types")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("outletId", defaultOutletId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("Should retrieve top selling items and category performance")
    void testTopSellingItemsAndCategories() throws Exception {
        mockMvc.perform(get("/api/reports/items/top-selling")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("outletId", defaultOutletId)
                        .param("limit", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());

        mockMvc.perform(get("/api/reports/categories/performance")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("outletId", defaultOutletId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("Should export detailed sales report as CSV")
    void testSalesReportCsvExport() throws Exception {
        MvcResult csvRes = mockMvc.perform(get("/api/reports/sales/export")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("outletId", defaultOutletId))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("text/csv"))
                .andExpect(header().string("Content-Disposition", containsString("attachment; filename=\"sales-report-")))
                .andReturn();

        String csvBody = csvRes.getResponse().getContentAsString();
        org.junit.jupiter.api.Assertions.assertTrue(csvBody.startsWith("Bill Number,Order Number,Order Type"));
    }

    @Test
    @DisplayName("Should perform outlet preferences and tax configuration CRUD")
    void testOutletSettingsAndTaxCrud() throws Exception {
        // 1. Get current settings
        mockMvc.perform(get("/api/settings")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("outletId", defaultOutletId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.currencySymbol").exists());

        // 2. Update settings
        OutletSettingsDto updateReq = new OutletSettingsDto();
        updateReq.setRestaurantName("RestoMaster Flagship");
        updateReq.setCurrency("USD");
        updateReq.setCurrencySymbol("$");
        updateReq.setReceiptHeader("Welcome to RestoMaster Flagship");
        updateReq.setReceiptFooter("Have a delicious day!");
        updateReq.setDefaultServiceCharge(new BigDecimal("5.00"));
        updateReq.setDefaultOrderType("DINE_IN");

        mockMvc.perform(post("/api/settings")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("outletId", defaultOutletId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.restaurantName").value("RestoMaster Flagship"))
                .andExpect(jsonPath("$.data.receiptFooter").value("Have a delicious day!"));

        // 3. Create Tax Rate
        TaxDto taxReq = new TaxDto();
        taxReq.setOutletId(defaultOutletId);
        taxReq.setName("State GST");
        taxReq.setPercentage(new BigDecimal("6.00"));
        taxReq.setInclusive(false);
        taxReq.setActive(true);

        MvcResult createTaxRes = mockMvc.perform(post("/api/taxes")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(taxReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("State GST"))
                .andExpect(jsonPath("$.data.percentage").value(6.0))
                .andReturn();
        String taxId = objectMapper.readTree(createTaxRes.getResponse().getContentAsString()).path("data").path("id").asText();

        // 4. List Taxes
        mockMvc.perform(get("/api/taxes")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("outletId", defaultOutletId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasItem(hasEntry("id", taxId))));

        // 5. Update Tax
        taxReq.setName("State GST Updated");
        taxReq.setPercentage(new BigDecimal("7.50"));
        mockMvc.perform(put("/api/taxes/" + taxId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(taxReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("State GST Updated"))
                .andExpect(jsonPath("$.data.percentage").value(7.5));

        // 6. Delete Tax
        mockMvc.perform(delete("/api/taxes/" + taxId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should reject unauthenticated requests to reporting and settings endpoints")
    void testUnauthorizedAccess() throws Exception {
        mockMvc.perform(get("/api/reports/sales/summary"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/settings"))
                .andExpect(status().isForbidden());
    }

    // --- Helper Methods ---

    private String createCategory(String name) throws Exception {
        CreateCategoryRequest req = new CreateCategoryRequest(defaultOutletId, name, "Description for " + name, 1, true, "MAIN_KITCHEN");
        MvcResult res = mockMvc.perform(post("/api/menu/categories")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(res.getResponse().getContentAsString()).path("data").path("id").asText();
    }

    private String createMenuItem(String categoryId, String name, BigDecimal price) throws Exception {
        CreateMenuItemRequest req = new CreateMenuItemRequest(
                categoryId,
                name,
                "Description for " + name,
                price,
                price.multiply(new BigDecimal("0.35")),
                new BigDecimal("5.00"),
                null,
                true,
                15,
                "Spicy instructions",
                new java.util.HashSet<>()
        );
        MvcResult res = mockMvc.perform(post("/api/menu/items")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(res.getResponse().getContentAsString()).path("data").path("id").asText();
    }
}
