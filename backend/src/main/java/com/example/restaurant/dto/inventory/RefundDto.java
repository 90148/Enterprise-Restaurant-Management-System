package com.example.restaurant.dto.inventory;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class RefundDto {

    private String id;
    private String paymentId;
    private String billId;
    private String billNumber;
    private BigDecimal amount;
    private String paymentMethod;
    private String reason;
    private String status;
    private String createdByName;
    private LocalDateTime createdAt;

    public RefundDto() {
    }

    public RefundDto(String id, String paymentId, String billId, String billNumber,
                     BigDecimal amount, String paymentMethod, String reason,
                     String status, String createdByName, LocalDateTime createdAt) {
        this.id = id;
        this.paymentId = paymentId;
        this.billId = billId;
        this.billNumber = billNumber;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.reason = reason;
        this.status = status;
        this.createdByName = createdByName;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public String getBillId() {
        return billId;
    }

    public void setBillId(String billId) {
        this.billId = billId;
    }

    public String getBillNumber() {
        return billNumber;
    }

    public void setBillNumber(String billNumber) {
        this.billNumber = billNumber;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
