package com.example.restaurant.dto.setting;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

public class OutletSettingsDto {
    private String outletId;
    private String restaurantName;
    private String currency = "USD";
    private String currencySymbol = "$";
    private String timezone = "UTC";
    private BigDecimal defaultServiceCharge = BigDecimal.ZERO;
    private String receiptHeader;
    private String receiptFooter = "Thank you for dining with us! Please visit again.";
    private String taxNumber;
    private boolean autoPrintReceipt = false;
    private String defaultOrderType = "DINE_IN";
    private Map<String, String> customSettings = new HashMap<>();

    public OutletSettingsDto() {
    }

    public String getOutletId() {
        return outletId;
    }

    public void setOutletId(String outletId) {
        this.outletId = outletId;
    }

    public String getRestaurantName() {
        return restaurantName;
    }

    public void setRestaurantName(String restaurantName) {
        this.restaurantName = restaurantName;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getCurrencySymbol() {
        return currencySymbol;
    }

    public void setCurrencySymbol(String currencySymbol) {
        this.currencySymbol = currencySymbol;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public BigDecimal getDefaultServiceCharge() {
        return defaultServiceCharge;
    }

    public void setDefaultServiceCharge(BigDecimal defaultServiceCharge) {
        this.defaultServiceCharge = defaultServiceCharge;
    }

    public String getReceiptHeader() {
        return receiptHeader;
    }

    public void setReceiptHeader(String receiptHeader) {
        this.receiptHeader = receiptHeader;
    }

    public String getReceiptFooter() {
        return receiptFooter;
    }

    public void setReceiptFooter(String receiptFooter) {
        this.receiptFooter = receiptFooter;
    }

    public String getTaxNumber() {
        return taxNumber;
    }

    public void setTaxNumber(String taxNumber) {
        this.taxNumber = taxNumber;
    }

    public boolean isAutoPrintReceipt() {
        return autoPrintReceipt;
    }

    public void setAutoPrintReceipt(boolean autoPrintReceipt) {
        this.autoPrintReceipt = autoPrintReceipt;
    }

    public String getDefaultOrderType() {
        return defaultOrderType;
    }

    public void setDefaultOrderType(String defaultOrderType) {
        this.defaultOrderType = defaultOrderType;
    }

    public Map<String, String> getCustomSettings() {
        return customSettings;
    }

    public void setCustomSettings(Map<String, String> customSettings) {
        this.customSettings = customSettings;
    }
}
