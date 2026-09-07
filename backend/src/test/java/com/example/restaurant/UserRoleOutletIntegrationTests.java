package com.example.restaurant;

import com.example.restaurant.dto.auth.LoginRequest;
import com.example.restaurant.dto.outlet.CreateOutletRequest;
import com.example.restaurant.dto.outlet.UpdateOutletRequest;
import com.example.restaurant.dto.role.CreateRoleRequest;
import com.example.restaurant.dto.role.UpdateRoleRequest;
import com.example.restaurant.dto.user.CreateUserRequest;
import com.example.restaurant.dto.user.UpdateUserRequest;
import com.example.restaurant.dto.user.UserStatusRequest;
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

import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class UserRoleOutletIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String adminToken;
    private String cashierToken;

    @BeforeEach
    void setUp() throws Exception {
        // Admin token
        LoginRequest adminLogin = new LoginRequest("admin", "Admin@123");
        MvcResult adminRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();
        adminToken = objectMapper.readTree(adminRes.getResponse().getContentAsString())
                .path("data").path("accessToken").asText();

        // Cashier token
        LoginRequest cashierLogin = new LoginRequest("cashier", "Cashier@123");
        MvcResult cashierRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cashierLogin)))
                .andExpect(status().isOk())
                .andReturn();
        cashierToken = objectMapper.readTree(cashierRes.getResponse().getContentAsString())
                .path("data").path("accessToken").asText();
    }

    @Test
    @DisplayName("User Management: CRUD, Search, Pagination, Status Toggle")
    void testUserCrudAndSearchAndPagination() throws Exception {
        // 1. Create User
        CreateUserRequest createReq = new CreateUserRequest();
        createReq.setUsername("testcashier100");
        createReq.setEmail("testcashier100@restomaster.io");
        createReq.setPassword("Password@123");
        createReq.setFullName("Test Cashier 100");
        createReq.setPhone("+1-555-0999");
        createReq.setRoles(Set.of("CASHIER"));

        MvcResult createRes = mockMvc.perform(post("/api/users")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value("testcashier100"))
                .andReturn();

        String userId = objectMapper.readTree(createRes.getResponse().getContentAsString())
                .path("data").path("id").asText();

        // 2. Search & Pagination
        mockMvc.perform(get("/api/users")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("search", "testcashier100")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content[0].username").value("testcashier100"));

        // 3. Update User
        UpdateUserRequest updateReq = new UpdateUserRequest();
        updateReq.setFullName("Updated Test Cashier");
        updateReq.setEmail("testcashier100_upd@restomaster.io");
        updateReq.setPhone("+1-555-1111");
        updateReq.setRoles(Set.of("CASHIER", "WAITER"));

        mockMvc.perform(put("/api/users/" + userId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.fullName").value("Updated Test Cashier"))
                .andExpect(jsonPath("$.data.email").value("testcashier100_upd@restomaster.io"));

        // 4. Status Toggle (Deactivate)
        mockMvc.perform(patch("/api/users/" + userId + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UserStatusRequest(false))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.active").value(false));

        // 5. Delete User
        mockMvc.perform(delete("/api/users/" + userId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Role & Permission Management: Create Custom Role, Grouped Permissions, Protected Core Roles")
    void testRoleCrudAndPermissions() throws Exception {
        // 1. Get Grouped Permissions
        mockMvc.perform(get("/api/permissions/grouped")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.USER").isArray())
                .andExpect(jsonPath("$.data.ORDER").isArray());

        // 2. Create Custom Role
        CreateRoleRequest roleReq = new CreateRoleRequest();
        roleReq.setName("FLOOR_LEAD");
        roleReq.setDescription("Shift supervisor for floor staff");

        MvcResult roleRes = mockMvc.perform(post("/api/roles")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(roleReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("FLOOR_LEAD"))
                .andReturn();

        String roleId = objectMapper.readTree(roleRes.getResponse().getContentAsString())
                .path("data").path("id").asText();

        // 3. Update Role Description
        UpdateRoleRequest updateRole = new UpdateRoleRequest();
        updateRole.setDescription("Updated shift supervisor description");

        mockMvc.perform(put("/api/roles/" + roleId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRole)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.description").value("Updated shift supervisor description"));

        // 4. Delete Custom Role
        mockMvc.perform(delete("/api/roles/" + roleId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Outlet Management: Create Outlet, List, Update, Status Toggle")
    void testOutletCrudAndStatus() throws Exception {
        // 1. Create Outlet
        CreateOutletRequest createReq = new CreateOutletRequest();
        createReq.setName("Airport Terminal 3 Express");
        createReq.setCode("OUT-AIR-03");
        createReq.setAddress("Gate 42, Terminal 3");
        createReq.setPhone("+1-555-4242");
        createReq.setEmail("t3@restomaster.io");
        createReq.setOpeningTime("05:00");
        createReq.setClosingTime("01:00");

        MvcResult createRes = mockMvc.perform(post("/api/outlets")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.code").value("OUT-AIR-03"))
                .andReturn();

        String outletId = objectMapper.readTree(createRes.getResponse().getContentAsString())
                .path("data").path("id").asText();

        // 2. List Outlets
        mockMvc.perform(get("/api/outlets")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("page", "0")
                        .param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray());

        // 3. Update Outlet
        UpdateOutletRequest updateReq = new UpdateOutletRequest();
        updateReq.setName("Airport T3 Concourse Express");
        updateReq.setOpeningTime("04:30");
        updateReq.setClosingTime("02:00");

        mockMvc.perform(put("/api/outlets/" + outletId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Airport T3 Concourse Express"));

        // 4. Status Toggle
        mockMvc.perform(patch("/api/outlets/" + outletId + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UserStatusRequest(false))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.active").value(false));

        // 5. Delete Outlet
        mockMvc.perform(delete("/api/outlets/" + outletId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Authorization Check: Cashier is rejected from User/Role/Outlet creation")
    void testAuthorizationRejection() throws Exception {
        // Cashier tries to create a user -> 403 Forbidden
        CreateUserRequest userReq = new CreateUserRequest();
        userReq.setUsername("unauthorized_user");
        userReq.setEmail("unauth@restomaster.io");
        userReq.setPassword("Password@123");
        userReq.setFullName("Unauthorized");
        userReq.setRoles(Set.of("WAITER"));

        mockMvc.perform(post("/api/users")
                        .header("Authorization", "Bearer " + cashierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userReq)))
                .andExpect(status().isForbidden());

        // Cashier tries to create an outlet -> 403 Forbidden
        CreateOutletRequest outletReq = new CreateOutletRequest();
        outletReq.setName("Forbidden Outlet");
        outletReq.setCode("OUT-FORBID");

        mockMvc.perform(post("/api/outlets")
                        .header("Authorization", "Bearer " + cashierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(outletReq)))
                .andExpect(status().isForbidden());
    }
}
