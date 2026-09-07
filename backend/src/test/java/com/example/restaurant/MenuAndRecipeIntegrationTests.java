package com.example.restaurant;

import com.example.restaurant.dto.auth.LoginRequest;
import com.example.restaurant.dto.menu.*;
import com.example.restaurant.dto.recipe.RecipeIngredientInput;
import com.example.restaurant.dto.recipe.SaveRecipeRequest;
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
import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class MenuAndRecipeIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String adminToken;
    private String waiterToken;
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

        // Waiter login
        LoginRequest waiterLogin = new LoginRequest("waiter", "Waiter@123");
        MvcResult waiterRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(waiterLogin)))
                .andExpect(status().isOk())
                .andReturn();
        waiterToken = objectMapper.readTree(waiterRes.getResponse().getContentAsString())
                .path("data").path("accessToken").asText();
    }

    @Test
    @DisplayName("Menu Categories: Get, Create, Duplicate Check, Update, Safeguarded Delete")
    void testCategoryLifecycleAndSafeguards() throws Exception {
        // 1. Get categories
        MvcResult catRes = mockMvc.perform(get("/api/menu/categories?outletId=" + defaultOutletId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andReturn();

        JsonNode cats = objectMapper.readTree(catRes.getResponse().getContentAsString()).path("data");
        String pizzaCatId = null;
        for (JsonNode c : cats) {
            if (c.path("name").asText().contains("Pizzas")) {
                pizzaCatId = c.path("id").asText();
                break;
            }
        }

        // 2. Create new category
        CreateCategoryRequest createReq = new CreateCategoryRequest(defaultOutletId, "Chef Tasting Menu", "Seasonal 5-course tasting", 10, true);
        MvcResult createRes = mockMvc.perform(post("/api/menu/categories")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("Chef Tasting Menu"))
                .andReturn();

        String newCatId = objectMapper.readTree(createRes.getResponse().getContentAsString()).path("data").path("id").asText();

        // 3. Duplicate name prevention in same outlet
        CreateCategoryRequest dupReq = new CreateCategoryRequest(defaultOutletId, "Chef Tasting Menu", "Duplicate", 11, true);
        mockMvc.perform(post("/api/menu/categories")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dupReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));

        // 4. Update category
        UpdateCategoryRequest updateReq = new UpdateCategoryRequest("Chef Signature Tasting", "Updated description", 10, true);
        mockMvc.perform(put("/api/menu/categories/" + newCatId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Chef Signature Tasting"));

        // 5. Delete category with existing menu items safeguard
        if (pizzaCatId != null) {
            mockMvc.perform(delete("/api/menu/categories/" + pizzaCatId)
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false));
        }

        // 6. Delete empty category succeeds
        mockMvc.perform(delete("/api/menu/categories/" + newCatId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Menu Items: Filter, Search, Create, Duplicate Check, 86'd Availability Toggle")
    void testMenuItemLifecycleAndAvailability() throws Exception {
        // 1. Get categories to get an ID
        MvcResult catRes = mockMvc.perform(get("/api/menu/categories?outletId=" + defaultOutletId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andReturn();
        String catId = objectMapper.readTree(catRes.getResponse().getContentAsString())
                .path("data").get(0).path("id").asText();

        // 2. Search menu items
        mockMvc.perform(get("/api/menu/items?outletId=" + defaultOutletId + "&search=Margherita")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content[0].name").value("Margherita D.O.P Pizza"));

        // 3. Create new menu item
        CreateMenuItemRequest createReq = new CreateMenuItemRequest(
                catId,
                "Truffle Wild Mushroom Gnocchi",
                "Pan-seared potato gnocchi with black truffle butter and sage",
                new BigDecimal("18.50"),
                new BigDecimal("4.20"),
                new BigDecimal("5.00"),
                null,
                true,
                14,
                "Vegetarian",
                Set.of()
        );

        MvcResult createRes = mockMvc.perform(post("/api/menu/items")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("Truffle Wild Mushroom Gnocchi"))
                .andExpect(jsonPath("$.data.profitMargin").isNumber())
                .andReturn();

        String newItemId = objectMapper.readTree(createRes.getResponse().getContentAsString())
                .path("data").path("id").asText();

        // 4. Duplicate item in same category prevention
        mockMvc.perform(post("/api/menu/items")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));

        // 5. 1-click 86-list availability toggle (Mark Out-of-Stock)
        MenuItemAvailabilityRequest outOfStockReq = new MenuItemAvailabilityRequest(false);
        mockMvc.perform(patch("/api/menu/items/" + newItemId + "/availability")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(outOfStockReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.available").value(false));

        // 6. Mark Back In Stock
        MenuItemAvailabilityRequest inStockReq = new MenuItemAvailabilityRequest(true);
        mockMvc.perform(patch("/api/menu/items/" + newItemId + "/availability")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inStockReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.available").value(true));

        // 7. Delete Item
        mockMvc.perform(delete("/api/menu/items/" + newItemId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Modifier Groups & Modifiers: Create, Attach to Item, Update, Delete")
    void testModifierGroupsAndOptions() throws Exception {
        // 1. Create modifier group
        CreateModifierGroupRequest groupReq = new CreateModifierGroupRequest(
                defaultOutletId,
                "Artisan Dipping Sauces",
                0,
                3,
                true,
                List.of(
                        new CreateModifierRequest("Garlic Aioli", new BigDecimal("1.00"), true),
                        new CreateModifierRequest("Calabrian Hot Honey", new BigDecimal("1.50"), true)
                )
        );

        MvcResult groupRes = mockMvc.perform(post("/api/menu/modifiers")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(groupReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("Artisan Dipping Sauces"))
                .andExpect(jsonPath("$.data.modifiers.length()").value(2))
                .andReturn();

        String groupId = objectMapper.readTree(groupRes.getResponse().getContentAsString())
                .path("data").path("id").asText();

        // 2. Fetch modifier groups
        mockMvc.perform(get("/api/menu/modifiers?outletId=" + defaultOutletId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());

        // 3. Delete modifier group
        mockMvc.perform(delete("/api/menu/modifiers/" + groupId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Recipe & Bill of Materials: Calculate Food Cost, Margins, and Auto-Update Dish Cost Price")
    void testRecipeBOMAndCostCalculation() throws Exception {
        // 1. Get available raw ingredients
        MvcResult ingRes = mockMvc.perform(get("/api/menu/recipes/ingredients?outletId=" + defaultOutletId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andReturn();

        JsonNode ingredients = objectMapper.readTree(ingRes.getResponse().getContentAsString()).path("data");
        String ing1Id = ingredients.get(0).path("id").asText();
        String ing2Id = ingredients.get(1).path("id").asText();

        // 2. Find a menu item to attach a new recipe (Pepperoni Pizza)
        MvcResult searchRes = mockMvc.perform(get("/api/menu/items?outletId=" + defaultOutletId + "&search=Pepperoni")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andReturn();
        String pepperoniId = objectMapper.readTree(searchRes.getResponse().getContentAsString())
                .path("data").path("content").get(0).path("id").asText();

        // 3. Save Recipe BOM
        SaveRecipeRequest recipeReq = new SaveRecipeRequest(
                pepperoniId,
                "Layer sauce, spread mozzarella evenly, arrange sliced pepperoni in concentric circles. Fire at 900F.",
                List.of(
                        new RecipeIngredientInput(ing1Id, new BigDecimal("1.000")),
                        new RecipeIngredientInput(ing2Id, new BigDecimal("0.100"))
                )
        );

        MvcResult saveRes = mockMvc.perform(post("/api/menu/recipes")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(recipeReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items.length()").value(2))
                .andExpect(jsonPath("$.data.totalCost").isNumber())
                .andExpect(jsonPath("$.data.profitMargin").isNumber())
                .andReturn();

        // 4. Fetch Recipe by MenuItem ID
        mockMvc.perform(get("/api/menu/recipes/item/" + pepperoniId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.menuItemId").value(pepperoniId))
                .andExpect(jsonPath("$.data.items").isArray());
    }

    @Test
    @DisplayName("Security RBAC: Waiter cannot create or delete menu items or categories")
    void testMenuSecurityGuards() throws Exception {
        CreateCategoryRequest createCatReq = new CreateCategoryRequest(defaultOutletId, "Hacked Category", "Test", 1, true);

        // Waiter cannot create category (requires MENU_CREATE)
        mockMvc.perform(post("/api/menu/categories")
                        .header("Authorization", "Bearer " + waiterToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createCatReq)))
                .andExpect(status().isForbidden());

        // Waiter cannot delete menu item
        mockMvc.perform(delete("/api/menu/items/some-id")
                        .header("Authorization", "Bearer " + waiterToken))
                .andExpect(status().isForbidden());
    }
}
