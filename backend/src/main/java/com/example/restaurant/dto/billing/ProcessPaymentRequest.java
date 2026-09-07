package com.example.restaurant.dto.billing;

import com.example.restaurant.entity.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class ProcessPaymentRequest {

    @NotNull(message = "Payment amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    private BigDecimal tenderedAmount;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    private String transactionRef;

    private String notes;

    public ProcessPaymentRequest() {
    }

    public ProcessPaymentRequest(BigDecimal amount, BigDecimal tenderedAmount,
                                 PaymentMethod paymentMethod, String transactionRef, String notes) {
        this.amount = amount;
        this.tenderedAmount = tenderedAmount;
        this.paymentMethod = paymentMethod;
        this.transactionRef = transactionRef;
        this.notes = notes;
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

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getTransactionRef() {
        return transactionRef;
    }

    public void setTransactionRef(String transactionRef) {
        this.transactionRef = transactionRef;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
