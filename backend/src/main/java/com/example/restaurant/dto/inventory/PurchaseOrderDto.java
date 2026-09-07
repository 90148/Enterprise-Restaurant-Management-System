package com.example.restaurant.dto.inventory;

import com.example.restaurant.entity.PurchaseOrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class PurchaseOrderDto {

    private String id;
    private String outletId;
    private String outletName;
    private String poNumber;
    private String supplierName;
    private String supplierContact;
    private PurchaseOrderStatus status;
    private BigDecimal totalAmount;
    private String notes;
    private String createdById;
    private String createdByName;
    private LocalDateTime receivedAt;
    private List<PurchaseOrderItemDto> items = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public PurchaseOrderDto() {
    }

    public PurchaseOrderDto(String id, String outletId, String outletName, String poNumber, String supplierName,
                            String supplierContact, PurchaseOrderStatus status, BigDecimal totalAmount,
                            String notes, String createdByName,
                            LocalDateTime receivedAt, LocalDateTime createdAt,
                            List<PurchaseOrderItemDto> items) {
        this.id = id;
        this.outletId = outletId;
        this.outletName = outletName;
        this.poNumber = poNumber;
        this.supplierName = supplierName;
        this.supplierContact = supplierContact;
        this.status = status;
        this.totalAmount = totalAmount;
        this.notes = notes;
        this.createdByName = createdByName;
        this.receivedAt = receivedAt;
        this.createdAt = createdAt;
        this.items = items != null ? items : new ArrayList<>();
    }

    public PurchaseOrderDto(String id, String outletId, String poNumber, String supplierName,
                            String supplierContact, PurchaseOrderStatus status, BigDecimal totalAmount,
                            String notes, String createdById, String createdByName,
                            LocalDateTime receivedAt, List<PurchaseOrderItemDto> items,
                            LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.outletId = outletId;
        this.poNumber = poNumber;
        this.supplierName = supplierName;
        this.supplierContact = supplierContact;
        this.status = status;
        this.totalAmount = totalAmount;
        this.notes = notes;
        this.createdById = createdById;
        this.createdByName = createdByName;
        this.receivedAt = receivedAt;
        this.items = items != null ? items : new ArrayList<>();
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOutletId() {
        return outletId;
    }

    public void setOutletId(String outletId) {
        this.outletId = outletId;
    }

    public String getOutletName() {
        return outletName;
    }

    public void setOutletName(String outletName) {
        this.outletName = outletName;
    }

    public String getPoNumber() {
        return poNumber;
    }

    public void setPoNumber(String poNumber) {
        this.poNumber = poNumber;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }

    public String getSupplierContact() {
        return supplierContact;
    }

    public void setSupplierContact(String supplierContact) {
        this.supplierContact = supplierContact;
    }

    public PurchaseOrderStatus getStatus() {
        return status;
    }

    public void setStatus(PurchaseOrderStatus status) {
        this.status = status;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
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

    public LocalDateTime getReceivedAt() {
        return receivedAt;
    }

    public void setReceivedAt(LocalDateTime receivedAt) {
        this.receivedAt = receivedAt;
    }

    public List<PurchaseOrderItemDto> getItems() {
        return items;
    }

    public void setItems(List<PurchaseOrderItemDto> items) {
        this.items = items;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
