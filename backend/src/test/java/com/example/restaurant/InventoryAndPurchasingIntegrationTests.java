package com.example.restaurant;

import com.example.restaurant.dto.auth.LoginRequest;
import com.example.restaurant.dto.billing.ProcessPaymentRequest;
import com.example.restaurant.dto.inventory.AdjustStockRequest;
import com.example.restaurant.dto.inventory.CreatePurchaseOrderItemRequest;
import com.example.restaurant.dto.inventory.CreatePurchaseOrderRequest;
import com.example.restaurant.dto.inventory.RefundRequest;
import com.example.restaurant.dto.menu.CreateCategoryRequest;
import com.example.restaurant.dto.menu.CreateMenuItemRequest;
import com.example.restaurant.dto.order.CreateOrderItemRequest;
import com.example.restaurant.dto.order.CreateOrderRequest;
import com.example.restaurant.dto.recipe.RecipeIngredientInput;
import com.example.restaurant.dto.recipe.SaveRecipeRequest;
import com.example.restaurant.entity.InventoryTransactionType;
import com.example.restaurant.entity.OrderType;
import com.example.restaurant.entity.PaymentMethod;
import com.example.restaurant.entity.PurchaseOrderStatus;
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
class InventoryAndPurchasingIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String adminToken;
    private String defaultOutletId;

    @BeforeEach
    void setUp() throws Exception {
        LoginRequest adminLogin = new LoginRequest("admin", "Admin@123");
        MvcResult adminRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode adminData = objectMapper.readTree(adminRes.getResponse().getContentAsString()).path("data");
        adminToken = adminData.path("accessToken").asText();
        defaultOutletId = adminData.path("user").path("outletId").asText();
    }

    @Test
    @DisplayName("Inventory: Search items, get details, view low stock items, and retrieve inventory stats")
    void testInventorySearchAndStats() throws Exception {
        // 1. Search inventory items
        MvcResult itemsRes = mockMvc.perform(get("/api/inventory/items?outletId=" + defaultOutletId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.totalElements", greaterThanOrEqualTo(1)))
                .andReturn();

        JsonNode firstItem = objectMapper.readTree(itemsRes.getResponse().getContentAsString())
                .path("data").path("content").get(0);
        String itemId = firstItem.path("id").asText();

        // 2. Get item by id
        mockMvc.perform(get("/api/inventory/items/" + itemId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(itemId))
                .andExpect(jsonPath("$.data.name").isNotEmpty());

        // 3. Get low stock items
        mockMvc.perform(get("/api/inventory/low-stock?outletId=" + defaultOutletId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());

        // 4. Get inventory overview stats
        mockMvc.perform(get("/api/inventory/stats?outletId=" + defaultOutletId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalItems", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.data.totalValuation").isNumber());
    }

    @Test
    @DisplayName("Inventory: Manual stock adjustment and audit transaction trail")
    void testStockAdjustmentAndTransactionAudit() throws Exception {
        // Get first item
        MvcResult itemsRes = mockMvc.perform(get("/api/inventory/items?outletId=" + defaultOutletId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode firstItem = objectMapper.readTree(itemsRes.getResponse().getContentAsString())
                .path("data").path("content").get(0);
        String itemId = firstItem.path("id").asText();
        BigDecimal initialStock = new BigDecimal(firstItem.path("currentStock").asText());

        // 1. Positive adjustment (restock)
        AdjustStockRequest addReq = new AdjustStockRequest(new BigDecimal("25.000"), InventoryTransactionType.ADJUSTMENT, "Weekly shipment restock");
        MvcResult addRes = mockMvc.perform(post("/api/inventory/items/" + itemId + "/adjust")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.currentStock").value(initialStock.add(new BigDecimal("25.000")).doubleValue()))
                .andReturn();

        // 2. Waste/damage adjustment (negative quantity)
        AdjustStockRequest wasteReq = new AdjustStockRequest(new BigDecimal("-3.500"), InventoryTransactionType.WASTE, "Expired / damaged containers");
        mockMvc.perform(post("/api/inventory/items/" + itemId + "/adjust")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wasteReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.currentStock").value(initialStock.add(new BigDecimal("21.500")).doubleValue()));

        // 3. Verify item transactions
        mockMvc.perform(get("/api/inventory/items/" + itemId + "/transactions")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].transactionType").value("WASTE"))
                .andExpect(jsonPath("$.data[1].transactionType").value("ADJUSTMENT"));
    }

    @Test
    @DisplayName("Purchasing: Create PO, Receive PO, verify stock increment & weighted average cost calculation")
    void testPurchaseOrderLifecycle() throws Exception {
        // 1. Get raw ingredients
        MvcResult itemsRes = mockMvc.perform(get("/api/inventory/items?outletId=" + defaultOutletId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode items = objectMapper.readTree(itemsRes.getResponse().getContentAsString()).path("data").path("content");
        String item1Id = items.get(0).path("id").asText();
        BigDecimal item1InitialStock = new BigDecimal(items.get(0).path("currentStock").asText());

        // 2. Create Purchase Order
        CreatePurchaseOrderRequest poReq = new CreatePurchaseOrderRequest(
                defaultOutletId,
                "Farm Fresh Organic Supplies",
                "+1-555-8888",
                "Bi-weekly bulk restock delivery",
                List.of(
                        new CreatePurchaseOrderItemRequest(item1Id, new BigDecimal("10.000"), new BigDecimal("15.50"))
                )
        );

        MvcResult poRes = mockMvc.perform(post("/api/purchases")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(poReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.poNumber", startsWith("PO-")))
                .andExpect(jsonPath("$.data.status").value("ORDERED"))
                .andExpect(jsonPath("$.data.totalAmount").value(155.00))
                .andExpect(jsonPath("$.data.items.length()").value(1))
                .andReturn();

        String poId = objectMapper.readTree(poRes.getResponse().getContentAsString()).path("data").path("id").asText();

        // 3. Receive the Purchase Order
        mockMvc.perform(post("/api/purchases/" + poId + "/receive")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("RECEIVED"))
                .andExpect(jsonPath("$.data.receivedAt").isNotEmpty());

        // 4. Verify stock increased on item1
        mockMvc.perform(get("/api/inventory/items/" + item1Id)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.currentStock").value(item1InitialStock.add(new BigDecimal("10.000")).doubleValue()));

        // 5. Cannot receive PO again (safeguard)
        mockMvc.perform(post("/api/purchases/" + poId + "/receive")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Recipe Stock Deduction: Settle bill and verify atomic recipe BOM inventory deduction")
    void testRecipeStockDeductionOnSettlement() throws Exception {
        // 1. Get raw ingredient for recipe
        MvcResult ingRes = mockMvc.perform(get("/api/inventory/items?outletId=" + defaultOutletId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode items = objectMapper.readTree(ingRes.getResponse().getContentAsString()).path("data").path("content");
        String ingredientId = items.get(0).path("id").asText();

        // Set initial stock to a known baseline (e.g. 100.000)
        AdjustStockRequest baseReq = new AdjustStockRequest(new BigDecimal("100.000"), InventoryTransactionType.ADJUSTMENT, "Baseline");
        mockMvc.perform(post("/api/inventory/items/" + ingredientId + "/adjust")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(baseReq)))
                .andExpect(status().isOk());

        MvcResult itemBeforeRes = mockMvc.perform(get("/api/inventory/items/" + ingredientId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andReturn();
        BigDecimal stockBefore = new BigDecimal(objectMapper.readTree(itemBeforeRes.getResponse().getContentAsString())
                .path("data").path("currentStock").asText());

        // 2. Create Category and Menu Item
        CreateCategoryRequest catReq = new CreateCategoryRequest(defaultOutletId, "Gourmet Specials " + System.currentTimeMillis(), "Specials", 1, true);
        MvcResult catRes = mockMvc.perform(post("/api/menu/categories")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(catReq)))
                .andExpect(status().isCreated())
                .andReturn();
        String catId = objectMapper.readTree(catRes.getResponse().getContentAsString()).path("data").path("id").asText();

        CreateMenuItemRequest itemReq = new CreateMenuItemRequest(
                catId, "Truffle Pasta " + System.currentTimeMillis(), "Handmade tagliatelle with black truffle",
                new BigDecimal("28.00"), new BigDecimal("9.00"), new BigDecimal("5.00"), null, true, 15, null, java.util.Set.of()
        );
        MvcResult menuRes = mockMvc.perform(post("/api/menu/items")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(itemReq)))
                .andExpect(status().isCreated())
                .andReturn();
        String menuItemId = objectMapper.readTree(menuRes.getResponse().getContentAsString()).path("data").path("id").asText();

        // 3. Attach Recipe BOM (2.000 units of ingredient per dish)
        SaveRecipeRequest recipeReq = new SaveRecipeRequest(
                menuItemId,
                "Boil fresh pasta for 3 minutes, toss in emulsified butter and fresh shaved truffles.",
                List.of(new RecipeIngredientInput(ingredientId, new BigDecimal("2.000")))
        );
        mockMvc.perform(post("/api/menu/recipes")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(recipeReq)))
                .andExpect(status().isOk());

        // 4. Place Order for 3 dishes (3 * 2.000 = 6.000 units of ingredient deduction expected)
        CreateOrderItemRequest orderItem = new CreateOrderItemRequest(menuItemId, 3, "Extra pepper", List.of());
        CreateOrderRequest orderReq = new CreateOrderRequest(
                defaultOutletId, null, OrderType.TAKEAWAY, "John Doe", "+1-555-1234", 1, "Quick takeaway", List.of(orderItem)
        );
        MvcResult orderRes = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isCreated())
                .andReturn();
        String orderId = objectMapper.readTree(orderRes.getResponse().getContentAsString()).path("data").path("id").asText();

        // 5. Generate Bill & Settle Payment in full
        MvcResult billRes = mockMvc.perform(post("/api/bills/order/" + orderId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isCreated())
                .andReturn();
        String billId = objectMapper.readTree(billRes.getResponse().getContentAsString()).path("data").path("id").asText();
        BigDecimal totalAmount = new BigDecimal(objectMapper.readTree(billRes.getResponse().getContentAsString())
                .path("data").path("totalAmount").asText());

        ProcessPaymentRequest payReq = new ProcessPaymentRequest(
                totalAmount, totalAmount, PaymentMethod.CASH, "INV-RECIPE-TEST", "Cash settlement"
        );
        mockMvc.perform(post("/api/bills/" + billId + "/payments")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PAID"));

        // 6. Verify ingredient stock deduction
        MvcResult itemAfterRes = mockMvc.perform(get("/api/inventory/items/" + ingredientId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andReturn();
        BigDecimal stockAfter = new BigDecimal(objectMapper.readTree(itemAfterRes.getResponse().getContentAsString())
                .path("data").path("currentStock").asText());

        // Should be stockBefore - 6.000
        BigDecimal expectedStock = stockBefore.subtract(new BigDecimal("6.000"));
        org.junit.jupiter.api.Assertions.assertEquals(0, expectedStock.compareTo(stockAfter));
    }

    @Test
    @DisplayName("Refunds: Process refund against payment, verify payment REFUNDED and bill balance adjusted")
    void testRefundLifecycle() throws Exception {
        // 1. Create order & bill
        CreateCategoryRequest catReq = new CreateCategoryRequest(defaultOutletId, "Refund Cat " + System.currentTimeMillis(), "Desc", 1, true);
        MvcResult catRes = mockMvc.perform(post("/api/menu/categories")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(catReq)))
                .andExpect(status().isCreated())
                .andReturn();
        String catId = objectMapper.readTree(catRes.getResponse().getContentAsString()).path("data").path("id").asText();

        CreateMenuItemRequest itemReq = new CreateMenuItemRequest(
                catId, "Refund Item " + System.currentTimeMillis(), "Desc",
                new BigDecimal("20.00"), new BigDecimal("5.00"), new BigDecimal("5.00"), null, true, 10, null, java.util.Set.of()
        );
        MvcResult menuRes = mockMvc.perform(post("/api/menu/items")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(itemReq)))
                .andExpect(status().isCreated())
                .andReturn();
        String menuItemId = objectMapper.readTree(menuRes.getResponse().getContentAsString()).path("data").path("id").asText();

        CreateOrderItemRequest orderItem = new CreateOrderItemRequest(menuItemId, 1, null, List.of());
        CreateOrderRequest orderReq = new CreateOrderRequest(
                defaultOutletId, null, OrderType.TAKEAWAY, "Refund Customer", "+1-555-9999", 1, null, List.of(orderItem)
        );
        MvcResult orderRes = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isCreated())
                .andReturn();
        String orderId = objectMapper.readTree(orderRes.getResponse().getContentAsString()).path("data").path("id").asText();

        MvcResult billRes = mockMvc.perform(post("/api/bills/order/" + orderId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isCreated())
                .andReturn();
        String billId = objectMapper.readTree(billRes.getResponse().getContentAsString()).path("data").path("id").asText();
        BigDecimal totalAmount = new BigDecimal(objectMapper.readTree(billRes.getResponse().getContentAsString())
                .path("data").path("totalAmount").asText());

        // 2. Settle payment
        ProcessPaymentRequest payReq = new ProcessPaymentRequest(
                totalAmount, totalAmount, PaymentMethod.CARD, "REFUND-CARD-TX-01", "Card payment"
        );
        MvcResult payRes = mockMvc.perform(post("/api/bills/" + billId + "/payments")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.payments.length()").value(1))
                .andReturn();

        String paymentId = objectMapper.readTree(payRes.getResponse().getContentAsString())
                .path("data").path("payments").get(0).path("id").asText();

        // 3. Process Refund
        RefundRequest refundReq = new RefundRequest(paymentId, totalAmount, "Customer dissatisfied, manager approved full refund");
        mockMvc.perform(post("/api/refunds")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refundReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.paymentId").value(paymentId))
                .andExpect(jsonPath("$.data.amount").value(totalAmount.doubleValue()))
                .andExpect(jsonPath("$.data.status").value("COMPLETED"));

        // 4. Verify cannot refund again
        mockMvc.perform(post("/api/refunds")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refundReq)))
                .andExpect(status().isBadRequest());

        // 5. Query outlet refunds list
        mockMvc.perform(get("/api/refunds?outletId=" + defaultOutletId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()", greaterThanOrEqualTo(1)));
    }
}
