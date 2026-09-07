package com.example.restaurant.service;

import com.example.restaurant.dto.role.CreateRoleRequest;
import com.example.restaurant.dto.role.PermissionDto;
import com.example.restaurant.dto.role.RoleDto;
import com.example.restaurant.dto.role.UpdateRoleRequest;
import com.example.restaurant.entity.Permission;
import com.example.restaurant.entity.Role;
import com.example.restaurant.exception.BusinessException;
import com.example.restaurant.exception.ResourceNotFoundException;
import com.example.restaurant.repository.PermissionRepository;
import com.example.restaurant.repository.RoleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    private static final Set<String> CORE_ROLES = Set.of("ADMIN", "MANAGER", "CASHIER", "WAITER", "KITCHEN", "INVENTORY");

    public RoleService(RoleRepository roleRepository, PermissionRepository permissionRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
    }

    @Transactional(readOnly = true)
    public List<RoleDto> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(this::mapToRoleDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RoleDto getRoleById(String id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));
        return mapToRoleDto(role);
    }

    @Transactional
    public RoleDto createRole(CreateRoleRequest request) {
        if (roleRepository.existsByName(request.getName().toUpperCase())) {
            throw new BusinessException("Role name '" + request.getName().toUpperCase() + "' already exists");
        }

        Set<Permission> permissions = new HashSet<>();
        if (request.getPermissionIds() != null && !request.getPermissionIds().isEmpty()) {
            permissions.addAll(permissionRepository.findAllById(request.getPermissionIds()));
        }

        Role role = new Role(
                UUID.randomUUID().toString(),
                request.getName().toUpperCase(),
                request.getDescription()
        );
        role.setPermissions(permissions);

        Role saved = roleRepository.save(role);
        return mapToRoleDto(saved);
    }

    @Transactional
    public RoleDto updateRole(String id, UpdateRoleRequest request) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));

        if (request.getDescription() != null) {
            role.setDescription(request.getDescription());
        }

        // Safeguard: Cannot remove permissions from ADMIN
        if ("ADMIN".equals(role.getName())) {
            // ADMIN must maintain all permissions
            List<Permission> allPermissions = permissionRepository.findAll();
            role.setPermissions(new HashSet<>(allPermissions));
        } else if (request.getPermissionIds() != null) {
            Set<Permission> permissions = new HashSet<>(permissionRepository.findAllById(request.getPermissionIds()));
            role.setPermissions(permissions);
        }

        Role updated = roleRepository.save(role);
        return mapToRoleDto(updated);
    }

    @Transactional
    public void deleteRole(String id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));

        if (CORE_ROLES.contains(role.getName())) {
            throw new BusinessException("Cannot delete protected system role: " + role.getName());
        }

        long usersWithRole = roleRepository.countUsersByRoleId(id);
        if (usersWithRole > 0) {
            throw new BusinessException("Cannot delete role '" + role.getName() + "' because it is currently assigned to " + usersWithRole + " user(s)");
        }

        roleRepository.delete(role);
    }

    @Transactional(readOnly = true)
    public Map<String, List<PermissionDto>> getAllPermissionsGrouped() {
        return permissionRepository.findAll().stream()
                .map(this::mapToPermissionDto)
                .collect(Collectors.groupingBy(PermissionDto::getCategory));
    }

    @Transactional(readOnly = true)
    public List<PermissionDto> getAllPermissions() {
        return permissionRepository.findAll().stream()
                .map(this::mapToPermissionDto)
                .collect(Collectors.toList());
    }

    private RoleDto mapToRoleDto(Role role) {
        RoleDto dto = new RoleDto();
        dto.setId(role.getId());
        dto.setName(role.getName());
        dto.setDescription(role.getDescription());
        dto.setCreatedAt(role.getCreatedAt());
        dto.setUpdatedAt(role.getUpdatedAt());
        dto.setUserCount((int) roleRepository.countUsersByRoleId(role.getId()));

        List<PermissionDto> permDtos = role.getPermissions().stream()
                .map(this::mapToPermissionDto)
                .collect(Collectors.toList());
        dto.setPermissions(permDtos);

        return dto;
    }

    private PermissionDto mapToPermissionDto(Permission p) {
        return new PermissionDto(p.getId(), p.getName(), p.getDescription(), p.getCategory());
    }
}
