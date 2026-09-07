# Business Workflows

## 1. End-to-End Operational Lifecycle
```
[1] LOGIN
     ↓
[2] SELECT OUTLET & FLOOR
     ↓
[3] SELECT TABLE (Available)
     ↓
[4] POS ORDER ENTRY (Category → Items → Cart → Taxes)
     ↓
[5] ORDER CONFIRMATION
     - Atomic Tx: Order created, Table status -> OCCUPIED, KOT # generated
     - WebSocket: Broadcast to Kitchen
     ↓
[6] KITCHEN DISPLAY SYSTEM (KDS)
     - New -> Accepted -> Preparing -> Ready -> Served
     ↓
[7] BILL GENERATION
     - Table status -> BILLING
     - Invoice generated with subtotal, taxes, discounts
     ↓
[8] PAYMENT SETTLEMENT
     - Cash / Card / UPI / Split Payment
     - Invoice status -> PAID, Order status -> COMPLETED
     ↓
[9] TABLE RELEASE & INVENTORY DEDUCTION
     - Table status -> AVAILABLE
     - Automated recipe bill-of-materials deduction
     - Immutable inventory_transactions recorded
     ↓
[10] ANALYTICS & REPORTING
     - Sales reports, Best sellers, Stock levels immediately reflect transaction
```
