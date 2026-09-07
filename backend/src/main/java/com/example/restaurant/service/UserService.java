package com.example.restaurant.service;

import com.example.restaurant.dto.auth.UserDto;
import com.example.restaurant.dto.user.CreateUserRequest;
import com.example.restaurant.dto.user.UpdateUserRequest;
import com.example.restaurant.entity.Outlet;
import com.example.restaurant.entity.Permission;
import com.example.restaurant.entity.Role;
import com.example.restaurant.entity.User;
import com.example.restaurant.exception.BusinessException;
import com.example.restaurant.exception.ResourceNotFoundException;
import com.example.restaurant.repository.OutletRepository;
import com.example.restaurant.repository.RoleRepository;
import com.example.restaurant.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final OutletRepository outletRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            OutletRepository outletRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.outletRepository = outletRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public Page<UserDto> getUsers(String search, Boolean active, String outletId, Pageable pageable) {
        String query = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String outlet = (outletId != null && !outletId.trim().isEmpty()) ? outletId.trim() : null;
        
        return userRepository.findByFilter(query, active, outlet, pageable)
                .map(this::mapToUserDto);
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return mapToUserDto(user);
    }

    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("Username '" + request.getUsername() + "' is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email '" + request.getEmail() + "' is already registered");
        }

        Set<Role> roles = new HashSet<>();
        for (String roleName : request.getRoles()) {
            Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new BusinessException("Role not found: " + roleName));
            roles.add(role);
        }

        Outlet outlet = null;
        if (request.getOutletId() != null && !request.getOutletId().isBlank()) {
            outlet = outletRepository.findById(request.getOutletId())
                    .orElseThrow(() -> new ResourceNotFoundException("Outlet", "id", request.getOutletId()));
        }

        User user = new User(
                UUID.randomUUID().toString(),
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName()
        );
        user.setPhone(request.getPhone());
        user.setOutlet(outlet);
        user.setRoles(roles);
        user.setActive(true);

        User saved = userRepository.save(user);
        return mapToUserDto(saved);
    }

    @Transactional
    public UserDto updateUser(String id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        userRepository.findByEmail(request.getEmail()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new BusinessException("Email '" + request.getEmail() + "' is already in use by another account");
            }
        });

        Set<Role> roles = new HashSet<>();
        for (String roleName : request.getRoles()) {
            Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new BusinessException("Role not found: " + roleName));
            roles.add(role);
        }

        Outlet outlet = null;
        if (request.getOutletId() != null && !request.getOutletId().isBlank()) {
            outlet = outletRepository.findById(request.getOutletId())
                    .orElseThrow(() -> new ResourceNotFoundException("Outlet", "id", request.getOutletId()));
        }

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setOutlet(outlet);
        user.setRoles(roles);

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            if (request.getPassword().length() < 6) {
                throw new BusinessException("Password must be at least 6 characters");
            }
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        User updated = userRepository.save(user);
        return mapToUserDto(updated);
    }

    @Transactional
    public UserDto updateUserStatus(String id, boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        // Safeguard: Do not deactivate the last active ADMIN
        if (!active) {
            boolean isAdmin = user.getRoles().stream().anyMatch(r -> "ADMIN".equals(r.getName()));
            if (isAdmin && userRepository.countActiveAdmins() <= 1) {
                throw new BusinessException("Cannot deactivate the only remaining active Administrator");
            }
        }

        user.setActive(active);
        User updated = userRepository.save(user);
        return mapToUserDto(updated);
    }

    @Transactional
    public void deleteUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        boolean isAdmin = user.getRoles().stream().anyMatch(r -> "ADMIN".equals(r.getName()));
        if (isAdmin && userRepository.countActiveAdmins() <= 1) {
            throw new BusinessException("Cannot delete the only remaining active Administrator");
        }

        userRepository.delete(user);
    }

    public UserDto mapToUserDto(User user) {
        List<String> roleNames = user.getRoles().stream().map(Role::getName).collect(Collectors.toList());
        List<String> permissionNames = user.getRoles().stream()
                .flatMap(r -> r.getPermissions().stream())
                .map(Permission::getName)
                .distinct()
                .collect(Collectors.toList());

        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setPhone(user.getPhone());
        dto.setActive(user.isActive());
        dto.setRoles(roleNames);
        dto.setPermissions(permissionNames);
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());

        if (user.getOutlet() != null) {
            dto.setOutletId(user.getOutlet().getId());
            dto.setOutletName(user.getOutlet().getName());
        }

        return dto;
    }
}
