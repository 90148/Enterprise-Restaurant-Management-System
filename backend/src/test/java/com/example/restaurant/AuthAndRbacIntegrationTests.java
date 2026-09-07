package com.example.restaurant;

import com.example.restaurant.dto.auth.LoginRequest;
import com.example.restaurant.dto.auth.RefreshTokenRequest;
import com.example.restaurant.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class AuthAndRbacIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Test
    @DisplayName("1. Login with valid credentials returns 200 and valid JWT tokens")
    void testLogin_Success() throws Exception {
        LoginRequest request = new LoginRequest("admin", "Admin@123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isString())
                .andExpect(jsonPath("$.data.refreshToken").isString())
                .andExpect(jsonPath("$.data.user.username").value("admin"))
                .andExpect(jsonPath("$.data.roles[0]").value("ADMIN"))
                .andExpect(jsonPath("$.data.permissions").isArray());
    }

    @Test
    @DisplayName("2. Login with invalid password returns 401 Unauthorized")
    void testLogin_InvalidCredentials() throws Exception {
        LoginRequest request = new LoginRequest("admin", "WrongPassword@999");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid username or password"));
    }

    @Test
    @DisplayName("3. Login with inactive user account returns 403 Forbidden")
    void testLogin_InactiveAccount() throws Exception {
        LoginRequest request = new LoginRequest("inactive_user", "Inactive@123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Account is inactive. Please contact administrator."));
    }

    @Test
    @DisplayName("4. Refresh token rotation issues new access and refresh tokens")
    void testRefreshToken_Success() throws Exception {
        // First login to get a valid refresh token
        LoginRequest loginReq = new LoginRequest("cashier", "Cashier@123");
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode rootNode = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String initialRefreshToken = rootNode.path("data").path("refreshToken").asText();
        assertNotNull(initialRefreshToken);

        // Perform token refresh
        RefreshTokenRequest refreshReq = new RefreshTokenRequest(initialRefreshToken);
        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isString())
                .andExpect(jsonPath("$.data.refreshToken").isString())
                .andExpect(jsonPath("$.data.user.username").value("cashier"));
    }

    @Test
    @DisplayName("5. Refresh token with invalid token returns 400 Bad Request")
    void testRefreshToken_InvalidToken() throws Exception {
        RefreshTokenRequest refreshReq = new RefreshTokenRequest("non-existent-fake-token-12345");

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("6. Authorized API call with valid ADMIN JWT returns 200 OK")
    void testAuthorizedApi_AdminOnly_Success() throws Exception {
        LoginRequest loginReq = new LoginRequest("admin", "Admin@123");
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn();

        String token = objectMapper.readTree(loginResult.getResponse().getContentAsString())
                .path("data").path("accessToken").asText();

        mockMvc.perform(get("/api/rbac/admin-only")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.role").value("ADMIN"));
    }

    @Test
    @DisplayName("7. Unauthorized API call without JWT returns 403 Forbidden")
    void testUnauthorizedApi_WithoutToken() throws Exception {
        mockMvc.perform(get("/api/rbac/admin-only"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("8. Forbidden API call: CASHIER accessing ADMIN-only endpoint returns 403 Forbidden")
    void testForbiddenApi_CashierAccessingAdminOnly() throws Exception {
        LoginRequest loginReq = new LoginRequest("cashier", "Cashier@123");
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn();

        String cashierToken = objectMapper.readTree(loginResult.getResponse().getContentAsString())
                .path("data").path("accessToken").asText();

        mockMvc.perform(get("/api/rbac/admin-only")
                        .header("Authorization", "Bearer " + cashierToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("9. RBAC Permission enforcement: Kitchen staff accessing KITCHEN_VIEW succeeds, but SETTINGS_UPDATE fails")
    void testRbacPermissions_KitchenStaff() throws Exception {
        LoginRequest loginReq = new LoginRequest("kitchen", "Kitchen@123");
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn();

        String kitchenToken = objectMapper.readTree(loginResult.getResponse().getContentAsString())
                .path("data").path("accessToken").asText();

        // 1. Kitchen staff HAS KITCHEN_VIEW permission -> 200 OK
        mockMvc.perform(get("/api/rbac/kitchen-view")
                        .header("Authorization", "Bearer " + kitchenToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.permission").value("KITCHEN_VIEW"));

        // 2. Kitchen staff DOES NOT HAVE SETTINGS_UPDATE permission -> 403 Forbidden
        mockMvc.perform(get("/api/rbac/settings-update")
                        .header("Authorization", "Bearer " + kitchenToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("10. Expired JWT token is rejected on secured API")
    void testExpiredToken_IsRejected() throws Exception {
        // Generate an expired token (expired 1 hour ago)
        Date pastIssued = new Date(System.currentTimeMillis() - 7200000);
        Date pastExpiry = new Date(System.currentTimeMillis() - 3600000);

        String expiredToken = Jwts.builder()
                .subject("test-user-id")
                .claim("username", "admin")
                .claim("roles", List.of("ADMIN"))
                .issuedAt(pastIssued)
                .expiration(pastExpiry)
                .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)))
                .compact();

        mockMvc.perform(get("/api/rbac/admin-only")
                        .header("Authorization", "Bearer " + expiredToken))
                .andExpect(status().isForbidden());
    }
}
