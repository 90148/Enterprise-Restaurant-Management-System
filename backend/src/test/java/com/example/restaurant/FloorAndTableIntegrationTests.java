package com.example.restaurant;

import com.example.restaurant.dto.auth.LoginRequest;
import com.example.restaurant.dto.floor.CreateFloorRequest;
import com.example.restaurant.dto.floor.UpdateFloorRequest;
import com.example.restaurant.dto.table.CreateTableRequest;
import com.example.restaurant.dto.table.TablePositionDto;
import com.example.restaurant.dto.table.UpdateTableRequest;
import com.example.restaurant.dto.table.UpdateTableStatusRequest;
import com.example.restaurant.entity.TableShape;
import com.example.restaurant.entity.TableStatus;
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

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class FloorAndTableIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String adminToken;
    private String cashierToken;
    private String defaultOutletId;
    private String groundFloorId;

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
        cashierToken = objectMapper.readTree(cashierRes.getResponse().getContentAsString())
                .path("data").path("accessToken").asText();

        // Get ground floor ID
        MvcResult floorsRes = mockMvc.perform(get("/api/floors?outletId=" + defaultOutletId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode floors = objectMapper.readTree(floorsRes.getResponse().getContentAsString()).path("data");
        groundFloorId = floors.get(0).path("id").asText();
    }

    @Test
    @DisplayName("Floor Management: Get, Create, Duplicate Check, Update, Safeguarded Delete")
    void testFloorLifecycleAndSafeguards() throws Exception {
        // 1. Get Floors for default outlet
        mockMvc.perform(get("/api/floors?outletId=" + defaultOutletId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].tableCount").isNumber());

        // 2. Create a new Floor
        CreateFloorRequest createReq = new CreateFloorRequest(defaultOutletId, "VIP Penthouse Suite", 10, true);
        MvcResult createRes = mockMvc.perform(post("/api/floors")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("VIP Penthouse Suite"))
                .andExpect(jsonPath("$.data.floorNumber").value(10))
                .andReturn();

        String newFloorId = objectMapper.readTree(createRes.getResponse().getContentAsString())
                .path("data").path("id").asText();

        // 3. Duplicate Name Prevention
        CreateFloorRequest duplicateNameReq = new CreateFloorRequest(defaultOutletId, "VIP Penthouse Suite", 11, true);
        mockMvc.perform(post("/api/floors")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateNameReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));

        // 4. Duplicate Floor Number Prevention
        CreateFloorRequest duplicateNumReq = new CreateFloorRequest(defaultOutletId, "Another Suite", 10, true);
        mockMvc.perform(post("/api/floors")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateNumReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));

        // 5. Update Floor
        UpdateFloorRequest updateReq = new UpdateFloorRequest("VIP Penthouse Lounge", 10, true);
        mockMvc.perform(put("/api/floors/" + newFloorId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("VIP Penthouse Lounge"));

        // 6. Delete Floor with Existing Tables Safeguard (Ground floor has tables)
        mockMvc.perform(delete("/api/floors/" + groundFloorId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));

        // 7. Delete Empty Floor Succeeds
        mockMvc.perform(delete("/api/floors/" + newFloorId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Table Management: Get, Create, Duplicate Check, Update, Safeguarded Delete")
    void testTableLifecycleAndSafeguards() throws Exception {
        // 1. Get tables by floor
        mockMvc.perform(get("/api/tables?floorId=" + groundFloorId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(6));

        // 2. Get tables by outlet
        mockMvc.perform(get("/api/tables?outletId=" + defaultOutletId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(10));

        // 3. Create new table
        CreateTableRequest createReq = new CreateTableRequest(groundFloorId, "T-77", 4, TableShape.ROUND, 100, 100);
        MvcResult createRes = mockMvc.perform(post("/api/tables")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.tableNumber").value("T-77"))
                .andExpect(jsonPath("$.data.shape").value("ROUND"))
                .andExpect(jsonPath("$.data.status").value("AVAILABLE"))
                .andReturn();

        String newTableId = objectMapper.readTree(createRes.getResponse().getContentAsString())
                .path("data").path("id").asText();

        // 4. Duplicate table number on same floor prevention
        CreateTableRequest duplicateReq = new CreateTableRequest(groundFloorId, "T-77", 2, TableShape.SQUARE, 200, 200);
        mockMvc.perform(post("/api/tables")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));

        // 5. Update table details
        UpdateTableRequest updateReq = new UpdateTableRequest(groundFloorId, "T-77-REV", 6, TableShape.RECTANGLE, 120, 120, true);
        mockMvc.perform(put("/api/tables/" + newTableId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.tableNumber").value("T-77-REV"))
                .andExpect(jsonPath("$.data.capacity").value(6));

        // 6. Delete Available Table Succeeds
        mockMvc.perform(delete("/api/tables/" + newTableId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Table Operations: Status Transitions and Occupied Table Delete Protection")
    void testTableStatusTransitionsAndProtection() throws Exception {
        // Find T-01 on ground floor
        MvcResult tablesRes = mockMvc.perform(get("/api/tables?floorId=" + groundFloorId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode tables = objectMapper.readTree(tablesRes.getResponse().getContentAsString()).path("data");
        String table01Id = tables.get(0).path("id").asText();

        // 1. Cashier transitions status from AVAILABLE to OCCUPIED
        UpdateTableStatusRequest occupiedReq = new UpdateTableStatusRequest(TableStatus.OCCUPIED);
        mockMvc.perform(patch("/api/tables/" + table01Id + "/status")
                        .header("Authorization", "Bearer " + cashierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(occupiedReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("OCCUPIED"));

        // 2. Prevent deleting an OCCUPIED table
        mockMvc.perform(delete("/api/tables/" + table01Id)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));

        // 3. Transition to BILLING
        UpdateTableStatusRequest billingReq = new UpdateTableStatusRequest(TableStatus.BILLING);
        mockMvc.perform(patch("/api/tables/" + table01Id + "/status")
                        .header("Authorization", "Bearer " + cashierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(billingReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("BILLING"));

        // 4. Settle / Release back to AVAILABLE
        UpdateTableStatusRequest availableReq = new UpdateTableStatusRequest(TableStatus.AVAILABLE);
        mockMvc.perform(patch("/api/tables/" + table01Id + "/status")
                        .header("Authorization", "Bearer " + cashierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(availableReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("AVAILABLE"));
    }

    @Test
    @DisplayName("Table Positions and Stats Aggregations")
    void testTablePositionsAndStats() throws Exception {
        // 1. Fetch tables
        MvcResult tablesRes = mockMvc.perform(get("/api/tables?floorId=" + groundFloorId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode tables = objectMapper.readTree(tablesRes.getResponse().getContentAsString()).path("data");
        String table1Id = tables.get(0).path("id").asText();

        // 2. Batch update position
        List<TablePositionDto> posUpdate = List.of(new TablePositionDto(table1Id, 500, 300));
        mockMvc.perform(patch("/api/tables/positions")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(posUpdate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].posX").value(500))
                .andExpect(jsonPath("$.data[0].posY").value(300));

        // 3. Stats Aggregation
        mockMvc.perform(get("/api/tables/stats?outletId=" + defaultOutletId)
                        .header("Authorization", "Bearer " + cashierToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalTables").value(10))
                .andExpect(jsonPath("$.data.availableTables").isNumber())
                .andExpect(jsonPath("$.data.occupiedTables").isNumber())
                .andExpect(jsonPath("$.data.reservedTables").isNumber())
                .andExpect(jsonPath("$.data.billingTables").isNumber());
    }

    @Test
    @DisplayName("RBAC Security: Cashier cannot create or delete floor")
    void testFloorSecurityGuards() throws Exception {
        CreateFloorRequest createReq = new CreateFloorRequest(defaultOutletId, "Unauthorized Floor", 99, true);

        // Cashier has no OUTLET_CREATE or OUTLET_UPDATE
        mockMvc.perform(post("/api/floors")
                        .header("Authorization", "Bearer " + cashierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isForbidden());

        // Cashier cannot delete floor
        mockMvc.perform(delete("/api/floors/" + groundFloorId)
                        .header("Authorization", "Bearer " + cashierToken))
                .andExpect(status().isForbidden());
    }
}
