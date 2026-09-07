package com.example.restaurant.dto.billing;

import com.example.restaurant.entity.PaymentMethod;
import com.example.restaurant.entity.PaymentStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentDto {

    private String id;
    private String billId;
    private String outletId;
    private PaymentMethod paymentMethod;
    private BigDecimal amount;
    private BigDecimal tenderedAmount;
    private BigDecimal changeAmount;
    private String transactionRef;
    private PaymentStatus status;
    private String notes;
    private String createdById;
    private String createdByName;
    private LocalDateTime createdAt;

    public PaymentDto() {
    }

    public PaymentDto(String id, String billId, String outletId, PaymentMethod paymentMethod,
                      BigDecimal amount, BigDecimal tenderedAmount, BigDecimal changeAmount,
                      String transactionRef, PaymentStatus status, String notes,
                      String createdById, String createdByName, LocalDateTime createdAt) {
        this.id = id;
        this.billId = billId;
        this.outletId = outletId;
        this.paymentMethod = paymentMethod;
        this.amount = amount;
        this.tenderedAmount = tenderedAmount;
        this.changeAmount = changeAmount;
        this.transactionRef = transactionRef;
        this.status = status;
        this.notes = notes;
        this.createdById = createdById;
        this.createdByName = createdByName;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getBillId() {
        return billId;
    }

    public void setBillId(String billId) {
        this.billId = billId;
    }

    public String getOutletId() {
        return outletId;
    }

    public void setOutletId(String outletId) {
        this.outletId = outletId;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getTenderedAmount() {
        return tenderedAmount;
    }

    public void setTenderedAmount(BigDecimal tenderedAmount) {
        this.tenderedAmount = tenderedAmount;
    }

    public BigDecimal getChangeAmount() {
        return changeAmount;
    }

    public void setChangeAmount(BigDecimal changeAmount) {
        this.changeAmount = changeAmount;
    }

    public String getTransactionRef() {
        return transactionRef;
    }

    public void setTransactionRef(String transactionRef) {
        this.transactionRef = transactionRef;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getCreatedById() {
        return createdById;
    }

    public void setCreatedById(String createdById) {
        this.createdById = createdById;
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
