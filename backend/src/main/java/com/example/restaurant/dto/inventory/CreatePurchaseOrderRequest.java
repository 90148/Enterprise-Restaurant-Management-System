package com.example.restaurant.dto.inventory;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.List;

public class CreatePurchaseOrderRequest {

    @NotBlank(message = "Outlet ID is required")
    private String outletId;

    @NotBlank(message = "Supplier name is required")
    private String supplierName;

    private String supplierContact;

    private String notes;

    @NotEmpty(message = "Purchase order must contain at least one item")
    @Valid
    private List<CreatePurchaseOrderItemRequest> items = new ArrayList<>();

    public CreatePurchaseOrderRequest() {
    }

    public CreatePurchaseOrderRequest(String outletId, String supplierName, String supplierContact,
                                       String notes, List<CreatePurchaseOrderItemRequest> items) {
        this.outletId = outletId;
        this.supplierName = supplierName;
        this.supplierContact = supplierContact;
        this.notes = notes;
        this.items = items != null ? items : new ArrayList<>();
    }

    public String getOutletId() {
        return outletId;
    }

    public void setOutletId(String outletId) {
        this.outletId = outletId;
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<CreatePurchaseOrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<CreatePurchaseOrderItemRequest> items) {
        this.items = items != null ? items : new ArrayList<>();
    }
}
