package com.example.restaurant.service;

import com.example.restaurant.dto.menu.*;
import com.example.restaurant.entity.Modifier;
import com.example.restaurant.entity.ModifierGroup;
import com.example.restaurant.entity.Outlet;
import com.example.restaurant.exception.BusinessException;
import com.example.restaurant.exception.ResourceNotFoundException;
import com.example.restaurant.repository.ModifierGroupRepository;
import com.example.restaurant.repository.ModifierRepository;
import com.example.restaurant.repository.OutletRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ModifierService {

    private final ModifierGroupRepository groupRepository;
    private final ModifierRepository modifierRepository;
    private final OutletRepository outletRepository;

    public ModifierService(ModifierGroupRepository groupRepository,
                           ModifierRepository modifierRepository,
                           OutletRepository outletRepository) {
        this.groupRepository = groupRepository;
        this.modifierRepository = modifierRepository;
        this.outletRepository = outletRepository;
    }

    @Transactional(readOnly = true)
    public List<ModifierGroupDto> getModifierGroupsByOutlet(String outletId) {
        return groupRepository.findByOutletIdOrderByCreatedAtAsc(outletId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ModifierGroupDto getModifierGroupById(String id) {
        ModifierGroup group = groupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ModifierGroup", "id", id));
        return mapToDto(group);
    }

    @Transactional
    public ModifierGroupDto createModifierGroup(CreateModifierGroupRequest request) {
        Outlet outlet = null;
        if (request.getOutletId() != null) {
            outlet = outletRepository.findById(request.getOutletId())
                    .orElseThrow(() -> new ResourceNotFoundException("Outlet", "id", request.getOutletId()));
        }

        if (outlet != null && groupRepository.existsByOutletIdAndNameIgnoreCase(outlet.getId(), request.getName().trim())) {
            throw new BusinessException("Modifier group '" + request.getName().trim() + "' already exists in this outlet");
        }

        ModifierGroup group = new ModifierGroup(
                UUID.randomUUID().toString(),
                outlet,
                request.getName().trim(),
                request.getMinSelection(),
                request.getMaxSelection()
        );
        if (request.getActive() != null) {
            group.setActive(request.getActive());
        }

        // Add child modifiers
        if (request.getModifiers() != null) {
            for (CreateModifierRequest modReq : request.getModifiers()) {
                Modifier modifier = new Modifier(
                        UUID.randomUUID().toString(),
                        group,
                        modReq.getName().trim(),
                        modReq.getPrice()
                );
                if (modReq.getActive() != null) {
                    modifier.setActive(modReq.getActive());
                }
                group.getModifiers().add(modifier);
            }
        }

        ModifierGroup saved = groupRepository.save(group);
        return mapToDto(saved);
    }

    @Transactional
    public ModifierGroupDto updateModifierGroup(String id, CreateModifierGroupRequest request) {
        ModifierGroup group = groupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ModifierGroup", "id", id));

        String outletId = group.getOutlet() != null ? group.getOutlet().getId() : null;
        if (outletId != null && groupRepository.existsByOutletIdAndNameIgnoreCaseAndIdNot(outletId, request.getName().trim(), id)) {
            throw new BusinessException("Modifier group '" + request.getName().trim() + "' already exists in this outlet");
        }

        group.setName(request.getName().trim());
        group.setMinSelection(request.getMinSelection());
        group.setMaxSelection(request.getMaxSelection());
        if (request.getActive() != null) {
            group.setActive(request.getActive());
        }

        // Rebuild child modifiers
        group.getModifiers().clear();
        if (request.getModifiers() != null) {
            for (CreateModifierRequest modReq : request.getModifiers()) {
                Modifier modifier = new Modifier(
                        UUID.randomUUID().toString(),
                        group,
                        modReq.getName().trim(),
                        modReq.getPrice()
                );
                if (modReq.getActive() != null) {
                    modifier.setActive(modReq.getActive());
                }
                group.getModifiers().add(modifier);
            }
        }

        ModifierGroup saved = groupRepository.save(group);
        return mapToDto(saved);
    }

    @Transactional
    public void deleteModifierGroup(String id) {
        ModifierGroup group = groupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ModifierGroup", "id", id));
        groupRepository.delete(group);
    }

    public ModifierGroupDto mapToDto(ModifierGroup group) {
        List<ModifierDto> modDtos = group.getModifiers().stream()
                .map(m -> new ModifierDto(m.getId(), group.getId(), m.getName(), m.getPrice(), m.isActive()))
                .collect(Collectors.toList());

        return new ModifierGroupDto(
                group.getId(),
                group.getOutlet() != null ? group.getOutlet().getId() : null,
                group.getName(),
                group.getMinSelection(),
                group.getMaxSelection(),
                group.isActive(),
                modDtos
        );
    }
}
