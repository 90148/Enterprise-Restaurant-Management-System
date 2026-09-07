package com.example.restaurant.service;

import com.example.restaurant.dto.setting.OutletSettingsDto;
import com.example.restaurant.dto.setting.TaxDto;
import com.example.restaurant.entity.Outlet;
import com.example.restaurant.entity.Setting;
import com.example.restaurant.entity.Tax;
import com.example.restaurant.exception.ResourceNotFoundException;
import com.example.restaurant.repository.OutletRepository;
import com.example.restaurant.repository.SettingRepository;
import com.example.restaurant.repository.TaxRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SettingService {

    private final SettingRepository settingRepository;
    private final TaxRepository taxRepository;
    private final OutletRepository outletRepository;

    public SettingService(SettingRepository settingRepository,
                          TaxRepository taxRepository,
                          OutletRepository outletRepository) {
        this.settingRepository = settingRepository;
        this.taxRepository = taxRepository;
        this.outletRepository = outletRepository;
    }

    @Transactional(readOnly = true)
    public OutletSettingsDto getOutletSettings(String outletId) {
        Outlet outlet = outletRepository.findById(outletId)
                .orElseThrow(() -> new ResourceNotFoundException("Outlet", "id", outletId));

        List<Setting> settings = settingRepository.findByOutletId(outletId);
        Map<String, String> map = settings.stream()
                .collect(Collectors.toMap(Setting::getSettingKey, Setting::getSettingValue, (v1, v2) -> v2));

        OutletSettingsDto dto = new OutletSettingsDto();
        dto.setOutletId(outletId);
        dto.setRestaurantName(map.getOrDefault("restaurant_name", outlet.getName()));
        dto.setCurrency(map.getOrDefault("currency", "USD"));
        dto.setCurrencySymbol(map.getOrDefault("currency_symbol", "$"));
        dto.setTimezone(map.getOrDefault("timezone", "UTC"));

        String serviceChargeStr = map.get("service_charge_percent");
        if (serviceChargeStr != null && !serviceChargeStr.isBlank()) {
            try {
                dto.setDefaultServiceCharge(new BigDecimal(serviceChargeStr));
            } catch (Exception ignored) {
                dto.setDefaultServiceCharge(BigDecimal.ZERO);
            }
        }

        dto.setReceiptHeader(map.getOrDefault("receipt_header", outlet.getName() + " - " + (outlet.getAddress() != null ? outlet.getAddress() : "")));
        dto.setReceiptFooter(map.getOrDefault("receipt_footer", "Thank you for dining with us! Please visit again."));
        dto.setTaxNumber(map.getOrDefault("tax_number", outlet.getTaxNumber()));
        dto.setAutoPrintReceipt(Boolean.parseBoolean(map.getOrDefault("auto_print_receipt", "false")));
        dto.setDefaultOrderType(map.getOrDefault("default_order_type", "DINE_IN"));

        // Add any additional custom keys
        Map<String, String> custom = new HashMap<>();
        map.forEach((k, v) -> {
            if (!List.of("restaurant_name", "currency", "currency_symbol", "timezone",
                    "service_charge_percent", "receipt_header", "receipt_footer",
                    "tax_number", "auto_print_receipt", "default_order_type").contains(k)) {
                custom.put(k, v);
            }
        });
        dto.setCustomSettings(custom);

        return dto;
    }

    @Transactional
    public OutletSettingsDto updateOutletSettings(String outletId, OutletSettingsDto request) {
        Outlet outlet = outletRepository.findById(outletId)
                .orElseThrow(() -> new ResourceNotFoundException("Outlet", "id", outletId));

        Map<String, String> valuesToSave = new HashMap<>();
        if (request.getRestaurantName() != null) valuesToSave.put("restaurant_name", request.getRestaurantName());
        if (request.getCurrency() != null) valuesToSave.put("currency", request.getCurrency());
        if (request.getCurrencySymbol() != null) valuesToSave.put("currency_symbol", request.getCurrencySymbol());
        if (request.getTimezone() != null) valuesToSave.put("timezone", request.getTimezone());
        if (request.getDefaultServiceCharge() != null) valuesToSave.put("service_charge_percent", request.getDefaultServiceCharge().toString());
        if (request.getReceiptHeader() != null) valuesToSave.put("receipt_header", request.getReceiptHeader());
        if (request.getReceiptFooter() != null) valuesToSave.put("receipt_footer", request.getReceiptFooter());
        if (request.getTaxNumber() != null) valuesToSave.put("tax_number", request.getTaxNumber());
        valuesToSave.put("auto_print_receipt", String.valueOf(request.isAutoPrintReceipt()));
        if (request.getDefaultOrderType() != null) valuesToSave.put("default_order_type", request.getDefaultOrderType());

        if (request.getCustomSettings() != null) {
            valuesToSave.putAll(request.getCustomSettings());
        }

        for (Map.Entry<String, String> entry : valuesToSave.entrySet()) {
            Optional<Setting> existing = settingRepository.findByOutletIdAndSettingKey(outletId, entry.getKey());
            if (existing.isPresent()) {
                Setting s = existing.get();
                s.setSettingValue(entry.getValue());
                settingRepository.save(s);
            } else {
                Setting s = new Setting(UUID.randomUUID().toString(), outlet, entry.getKey(), entry.getValue());
                settingRepository.save(s);
            }
        }

        // Also sync outlet tax number and name if updated
        if (request.getTaxNumber() != null) {
            outlet.setTaxNumber(request.getTaxNumber());
        }
        if (request.getRestaurantName() != null && !request.getRestaurantName().isBlank()) {
            outlet.setName(request.getRestaurantName());
        }
        outletRepository.save(outlet);

        return getOutletSettings(outletId);
    }

    @Transactional(readOnly = true)
    public List<TaxDto> getTaxes(String outletId) {
        return taxRepository.findByOutletId(outletId).stream()
                .map(this::mapToTaxDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public TaxDto createTax(TaxDto request) {
        Outlet outlet = outletRepository.findById(request.getOutletId())
                .orElseThrow(() -> new ResourceNotFoundException("Outlet", "id", request.getOutletId()));

        Tax tax = new Tax(
                UUID.randomUUID().toString(),
                outlet,
                request.getName(),
                request.getPercentage() != null ? request.getPercentage() : BigDecimal.ZERO,
                request.isInclusive(),
                true
        );
        Tax saved = taxRepository.save(tax);
        return mapToTaxDto(saved);
    }

    @Transactional
    public TaxDto updateTax(String id, TaxDto request) {
        Tax tax = taxRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tax", "id", id));

        if (request.getName() != null) tax.setName(request.getName());
        if (request.getPercentage() != null) tax.setPercentage(request.getPercentage());
        tax.setInclusive(request.isInclusive());
        tax.setActive(request.isActive());

        Tax saved = taxRepository.save(tax);
        return mapToTaxDto(saved);
    }

    @Transactional
    public void deleteTax(String id) {
        Tax tax = taxRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tax", "id", id));
        taxRepository.delete(tax);
    }

    private TaxDto mapToTaxDto(Tax tax) {
        return new TaxDto(
                tax.getId(),
                tax.getOutlet().getId(),
                tax.getName(),
                tax.getPercentage(),
                tax.isInclusive(),
                tax.isActive()
        );
    }
}
