package com.example.restaurant.service;

import com.example.restaurant.dto.auth.AuthResponse;
import com.example.restaurant.dto.auth.LoginRequest;
import com.example.restaurant.dto.auth.RefreshTokenRequest;
import com.example.restaurant.dto.auth.UserDto;
import com.example.restaurant.entity.Permission;
import com.example.restaurant.entity.RefreshToken;
import com.example.restaurant.entity.Role;
import com.example.restaurant.entity.User;
import com.example.restaurant.exception.BusinessException;
import com.example.restaurant.exception.ResourceNotFoundException;
import com.example.restaurant.repository.RefreshTokenRepository;
import com.example.restaurant.repository.UserRepository;
import com.example.restaurant.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider tokenProvider;
    private final long refreshExpirationMs;

    public AuthService(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            JwtTokenProvider tokenProvider,
            @Value("${app.jwt.refresh-expiration-ms:604800000}") long refreshExpirationMs) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.tokenProvider = tokenProvider;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsernameOrEmail(request.getUsernameOrEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!user.isActive()) {
            throw new DisabledException("Account is inactive. Please contact administrator.");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsernameOrEmail(), request.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Invalid username or password");
        }

        List<String> roles = user.getRoles().stream().map(Role::getName).collect(Collectors.toList());
        List<String> permissions = user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(Permission::getName)
                .distinct()
                .collect(Collectors.toList());

        String outletId = user.getOutlet() != null ? user.getOutlet().getId() : null;

        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getUsername(), roles, permissions, outletId);
        String refreshTokenStr = createRefreshToken(user);

        UserDto userDto = mapToUserDto(user, roles, permissions);

        return new AuthResponse(accessToken, refreshTokenStr, userDto, roles, permissions);
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken token = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new BusinessException("Invalid or expired refresh token. Please login again."));

        if (token.isRevoked() || token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token);
            throw new BusinessException("Refresh token has expired or was revoked. Please login again.");
        }

        User user = token.getUser();
        if (!user.isActive()) {
            throw new DisabledException("User account is inactive.");
        }

        // Rotate refresh token
        refreshTokenRepository.delete(token);
        String newRefreshTokenStr = createRefreshToken(user);

        List<String> roles = user.getRoles().stream().map(Role::getName).collect(Collectors.toList());
        List<String> permissions = user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(Permission::getName)
                .distinct()
                .collect(Collectors.toList());

        String outletId = user.getOutlet() != null ? user.getOutlet().getId() : null;
        String newAccessToken = tokenProvider.generateAccessToken(user.getId(), user.getUsername(), roles, permissions, outletId);

        UserDto userDto = mapToUserDto(user, roles, permissions);

        return new AuthResponse(newAccessToken, newRefreshTokenStr, userDto, roles, permissions);
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        List<String> roles = user.getRoles().stream().map(Role::getName).collect(Collectors.toList());
        List<String> permissions = user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(Permission::getName)
                .distinct()
                .collect(Collectors.toList());

        return mapToUserDto(user, roles, permissions);
    }

    @Transactional
    public void logout(String refreshTokenStr) {
        if (refreshTokenStr != null && !refreshTokenStr.isBlank()) {
            refreshTokenRepository.findByToken(refreshTokenStr).ifPresent(refreshTokenRepository::delete);
        }
    }

    private String createRefreshToken(User user) {
        // Remove existing refresh tokens for clean single active session
        refreshTokenRepository.deleteByUser(user);

        String tokenStr = UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
        Instant expiryDate = Instant.now().plusMillis(refreshExpirationMs);

        RefreshToken refreshToken = new RefreshToken(
                UUID.randomUUID().toString(),
                user,
                tokenStr,
                expiryDate
        );
        refreshTokenRepository.save(refreshToken);

        return tokenStr;
    }

    private UserDto mapToUserDto(User user, List<String> roles, List<String> permissions) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setPhone(user.getPhone());
        dto.setActive(user.isActive());
        dto.setRoles(roles);
        dto.setPermissions(permissions);
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());

        if (user.getOutlet() != null) {
            dto.setOutletId(user.getOutlet().getId());
            dto.setOutletName(user.getOutlet().getName());
        }

        return dto;
    }
}
