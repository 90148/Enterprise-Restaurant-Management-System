package com.example.restaurant.dto.inventory;

import com.example.restaurant.entity.InventoryTransactionType;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class AdjustStockRequest {

    @NotNull(message = "Quantity delta is required")
    private BigDecimal quantityDelta;

    private InventoryTransactionType type = InventoryTransactionType.ADJUSTMENT;

    private String reason; // e.g. DAMAGE, SPOILAGE, PHYSICAL_COUNT_DISCREPANCY

    private String notes;

    public AdjustStockRequest() {
    }

    public AdjustStockRequest(BigDecimal quantityDelta, String reason, String notes) {
        this.quantityDelta = quantityDelta;
        this.reason = reason;
        this.notes = notes;
        this.type = InventoryTransactionType.ADJUSTMENT;
    }

    public AdjustStockRequest(BigDecimal quantityDelta, InventoryTransactionType type, String notes) {
        this.quantityDelta = quantityDelta;
        this.type = type != null ? type : InventoryTransactionType.ADJUSTMENT;
        this.reason = type != null ? type.name() : "ADJUSTMENT";
        this.notes = notes;
    }

    public BigDecimal getQuantityDelta() {
        return quantityDelta;
    }

    public void setQuantityDelta(BigDecimal quantityDelta) {
        this.quantityDelta = quantityDelta;
    }

    // Convenience alias for getQuantityDelta
    public BigDecimal getQuantity() {
        return quantityDelta;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantityDelta = quantity;
    }

    public InventoryTransactionType getType() {
        return type;
    }

    public void setType(InventoryTransactionType type) {
        this.type = type;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
