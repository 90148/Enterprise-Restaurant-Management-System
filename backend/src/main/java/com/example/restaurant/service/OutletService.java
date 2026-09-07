package com.example.restaurant.service;

import com.example.restaurant.dto.outlet.CreateOutletRequest;
import com.example.restaurant.dto.outlet.OutletDto;
import com.example.restaurant.dto.outlet.UpdateOutletRequest;
import com.example.restaurant.entity.Outlet;
import com.example.restaurant.exception.BusinessException;
import com.example.restaurant.exception.ResourceNotFoundException;
import com.example.restaurant.repository.OutletRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OutletService {

    private final OutletRepository outletRepository;

    public OutletService(OutletRepository outletRepository) {
        this.outletRepository = outletRepository;
    }

    @Transactional(readOnly = true)
    public Page<OutletDto> getOutlets(String search, Boolean active, Pageable pageable) {
        String query = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        return outletRepository.findByFilter(query, active, pageable)
                .map(this::mapToOutletDto);
    }

    @Transactional(readOnly = true)
    public List<OutletDto> getAllActiveOutlets() {
        return outletRepository.findByActiveTrue().stream()
                .map(this::mapToOutletDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OutletDto getOutletById(String id) {
        Outlet outlet = outletRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Outlet", "id", id));
        return mapToOutletDto(outlet);
    }

    @Transactional
    public OutletDto createOutlet(CreateOutletRequest request) {
        if (outletRepository.existsByCode(request.getCode().toUpperCase())) {
            throw new BusinessException("Outlet code '" + request.getCode().toUpperCase() + "' already exists");
        }

        Outlet outlet = new Outlet(
                UUID.randomUUID().toString(),
                request.getName(),
                request.getCode().toUpperCase()
        );
        outlet.setAddress(request.getAddress());
        outlet.setPhone(request.getPhone());
        outlet.setEmail(request.getEmail());
        outlet.setTaxNumber(request.getTaxNumber());
        outlet.setOpeningTime(request.getOpeningTime());
        outlet.setClosingTime(request.getClosingTime());
        outlet.setActive(true);

        Outlet saved = outletRepository.save(outlet);
        return mapToOutletDto(saved);
    }

    @Transactional
    public OutletDto updateOutlet(String id, UpdateOutletRequest request) {
        Outlet outlet = outletRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Outlet", "id", id));

        outlet.setName(request.getName());
        outlet.setAddress(request.getAddress());
        outlet.setPhone(request.getPhone());
        outlet.setEmail(request.getEmail());
        outlet.setTaxNumber(request.getTaxNumber());
        outlet.setOpeningTime(request.getOpeningTime());
        outlet.setClosingTime(request.getClosingTime());

        Outlet updated = outletRepository.save(outlet);
        return mapToOutletDto(updated);
    }

    @Transactional
    public OutletDto updateOutletStatus(String id, boolean active) {
        Outlet outlet = outletRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Outlet", "id", id));

        outlet.setActive(active);
        Outlet updated = outletRepository.save(outlet);
        return mapToOutletDto(updated);
    }

    @Transactional
    public void deleteOutlet(String id) {
        Outlet outlet = outletRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Outlet", "id", id));

        outletRepository.delete(outlet);
    }

    private OutletDto mapToOutletDto(Outlet o) {
        OutletDto dto = new OutletDto();
        dto.setId(o.getId());
        dto.setName(o.getName());
        dto.setCode(o.getCode());
        dto.setAddress(o.getAddress());
        dto.setPhone(o.getPhone());
        dto.setEmail(o.getEmail());
        dto.setTaxNumber(o.getTaxNumber());
        dto.setOpeningTime(o.getOpeningTime());
        dto.setClosingTime(o.getClosingTime());
        dto.setActive(o.isActive());
        dto.setCreatedAt(o.getCreatedAt());
        dto.setUpdatedAt(o.getUpdatedAt());
        return dto;
    }
}
