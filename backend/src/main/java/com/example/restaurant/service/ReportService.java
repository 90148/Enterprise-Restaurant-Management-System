package com.example.restaurant.service;

import com.example.restaurant.dto.inventory.InventoryItemSummaryDto;
import com.example.restaurant.dto.report.*;
import com.example.restaurant.entity.*;
import com.example.restaurant.exception.ResourceNotFoundException;
import com.example.restaurant.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final BillRepository billRepository;
    private final BillItemRepository billItemRepository;
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final RefundRepository refundRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final RestaurantTableRepository restaurantTableRepository;
    private final OutletRepository outletRepository;

    public ReportService(BillRepository billRepository,
                         BillItemRepository billItemRepository,
                         PaymentRepository paymentRepository,
                         OrderRepository orderRepository,
                         RefundRepository refundRepository,
                         InventoryItemRepository inventoryItemRepository,
                         InventoryTransactionRepository inventoryTransactionRepository,
                         RestaurantTableRepository restaurantTableRepository,
                         OutletRepository outletRepository) {
        this.billRepository = billRepository;
        this.billItemRepository = billItemRepository;
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.refundRepository = refundRepository;
        this.inventoryItemRepository = inventoryItemRepository;
        this.inventoryTransactionRepository = inventoryTransactionRepository;
        this.restaurantTableRepository = restaurantTableRepository;
        this.outletRepository = outletRepository;
    }

    private String resolveOutletId(String outletId) {
        if (outletId != null && !outletId.isBlank()) {
            return outletId;
        }
        return outletRepository.findAll().stream()
                .findFirst()
                .map(Outlet::getId)
                .orElseThrow(() -> new ResourceNotFoundException("Outlet", "default", "No outlet found"));
    }

    private BigDecimal toBigDecimal(Object val) {
        if (val == null) return BigDecimal.ZERO;
        if (val instanceof BigDecimal) return (BigDecimal) val;
        if (val instanceof Number) return BigDecimal.valueOf(((Number) val).doubleValue()).setScale(2, RoundingMode.HALF_UP);
        return new BigDecimal(val.toString()).setScale(2, RoundingMode.HALF_UP);
    }

    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats(String rawOutletId) {
        String outletId = resolveOutletId(rawOutletId);

        LocalDate today = LocalDate.now();
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime endOfToday = today.atTime(23, 59, 59);

        LocalDate yesterday = today.minusDays(1);
        LocalDateTime startOfYesterday = yesterday.atStartOfDay();
        LocalDateTime endOfYesterday = yesterday.atTime(23, 59, 59);

        BigDecimal todayRevenue = billRepository.sumRevenueBetween(outletId, startOfToday, endOfToday);
        BigDecimal yesterdayRevenue = billRepository.sumRevenueBetween(outletId, startOfYesterday, endOfYesterday);

        double revenueTrend = 0.0;
        if (yesterdayRevenue.compareTo(BigDecimal.ZERO) > 0) {
            revenueTrend = todayRevenue.subtract(yesterdayRevenue)
                    .divide(yesterdayRevenue, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        } else if (todayRevenue.compareTo(BigDecimal.ZERO) > 0) {
            revenueTrend = 100.0;
        }

        long totalTables = restaurantTableRepository.countByFloorOutletId(outletId);
        long occupiedTables = restaurantTableRepository.countByFloorOutletIdAndStatus(outletId, TableStatus.OCCUPIED);
        long billingTables = restaurantTableRepository.countByFloorOutletIdAndStatus(outletId, TableStatus.BILLING);
        long availableTables = restaurantTableRepository.countByFloorOutletIdAndStatus(outletId, TableStatus.AVAILABLE);
        long activeTables = occupiedTables + billingTables;

        long liveOrders = orderRepository.countByOutletIdAndStatusNotIn(
                outletId, List.of(OrderStatus.COMPLETED, OrderStatus.CANCELLED));
        long todayCompletedOrders = orderRepository.countTodayCompletedOrders(outletId, startOfToday);

        // Compute hourly trend for today
        List<HourlySalesDto> hourlyTrend = new ArrayList<>(24);
        for (int h = 0; h < 24; h++) {
            String label = (h == 0) ? "12 AM" : (h < 12) ? h + " AM" : (h == 12) ? "12 PM" : (h - 12) + " PM";
            hourlyTrend.add(new HourlySalesDto(h, label, BigDecimal.ZERO, 0));
        }

        List<Bill> todayBills = billRepository.findByOutletIdAndCreatedAtBetweenOrderByCreatedAtAsc(
                outletId, startOfToday, endOfToday);
        for (Bill bill : todayBills) {
            if (bill.getStatus() == BillStatus.PAID) {
                int hour = bill.getCreatedAt().getHour();
                HourlySalesDto hDto = hourlyTrend.get(hour);
                hDto.setRevenue(hDto.getRevenue().add(bill.getPaidAmount()));
                hDto.setOrderCount(hDto.getOrderCount() + 1);
            }
        }

        // Low stock items
        List<InventoryItem> lowStockEntities = inventoryItemRepository.findLowStockItems(outletId);
        List<InventoryItemSummaryDto> lowStockList = lowStockEntities.stream()
                .limit(10)
                .map(i -> new InventoryItemSummaryDto(
                        i.getId(),
                        i.getName(),
                        i.getSku(),
                        i.getUnit() != null ? i.getUnit().getName() : "",
                        i.getUnit() != null ? i.getUnit().getSymbol() : "",
                        i.getCurrentStock(),
                        i.getUnitCost()
                ))
                .collect(Collectors.toList());

        DashboardStatsDto dto = new DashboardStatsDto();
        dto.setTodayRevenue(todayRevenue);
        dto.setYesterdayRevenue(yesterdayRevenue);
        dto.setRevenueTrendPercent(revenueTrend);
        dto.setTotalTables(totalTables);
        dto.setActiveTables(activeTables);
        dto.setAvailableTables(availableTables);
        dto.setLiveOrders(liveOrders);
        dto.setTodayCompletedOrders(todayCompletedOrders);
        dto.setHourlyTrend(hourlyTrend);
        dto.setLowStockAlerts(lowStockList);

        return dto;
    }

    @Transactional(readOnly = true)
    public SalesSummaryDto getSalesSummary(String rawOutletId, LocalDateTime startDate, LocalDateTime endDate) {
        String outletId = resolveOutletId(rawOutletId);
        LocalDateTime start = (startDate != null) ? startDate : LocalDate.now().atStartOfDay();
        LocalDateTime end = (endDate != null) ? endDate : LocalDate.now().atTime(23, 59, 59);

        List<Bill> bills = billRepository.findByOutletIdAndCreatedAtBetweenOrderByCreatedAtAsc(outletId, start, end);

        BigDecimal grossSales = BigDecimal.ZERO;
        BigDecimal discountTotal = BigDecimal.ZERO;
        BigDecimal netSales = BigDecimal.ZERO;
        BigDecimal taxTotal = BigDecimal.ZERO;
        BigDecimal totalPaid = BigDecimal.ZERO;
        long totalBills = bills.size();

        for (Bill b : bills) {
            grossSales = grossSales.add(b.getSubtotal());
            discountTotal = discountTotal.add(b.getDiscountAmount());
            taxTotal = taxTotal.add(b.getTaxAmount());
            netSales = netSales.add(b.getTotalAmount());
            totalPaid = totalPaid.add(b.getPaidAmount());
        }

        BigDecimal totalRefunds = refundRepository.sumRefundsBetween(outletId, start, end);
        if (totalRefunds == null) {
            totalRefunds = BigDecimal.ZERO;
        }

        long totalOrders = billRepository.countBillsBetween(outletId, start, end);

        BigDecimal aov = BigDecimal.ZERO;
        if (totalBills > 0) {
            aov = totalPaid.divide(BigDecimal.valueOf(totalBills), 2, RoundingMode.HALF_UP);
        }

        return new SalesSummaryDto(
                grossSales,
                discountTotal,
                netSales,
                taxTotal,
                totalPaid,
                totalRefunds,
                totalOrders,
                totalBills,
                aov
        );
    }

    @Transactional(readOnly = true)
    public List<DailySalesDto> getDailySales(String rawOutletId, LocalDateTime startDate, LocalDateTime endDate) {
        String outletId = resolveOutletId(rawOutletId);
        LocalDateTime start = (startDate != null) ? startDate : LocalDate.now().minusDays(30).atStartOfDay();
        LocalDateTime end = (endDate != null) ? endDate : LocalDate.now().atTime(23, 59, 59);

        List<Bill> bills = billRepository.findByOutletIdAndCreatedAtBetweenOrderByCreatedAtAsc(outletId, start, end);

        Map<LocalDate, List<Bill>> grouped = bills.stream()
                .collect(Collectors.groupingBy(b -> b.getCreatedAt().toLocalDate(), LinkedHashMap::new, Collectors.toList()));

        List<DailySalesDto> list = new ArrayList<>();
        grouped.forEach((date, dateBills) -> {
            BigDecimal gross = BigDecimal.ZERO;
            BigDecimal net = BigDecimal.ZERO;
            BigDecimal tax = BigDecimal.ZERO;
            BigDecimal disc = BigDecimal.ZERO;
            BigDecimal paid = BigDecimal.ZERO;

            for (Bill b : dateBills) {
                gross = gross.add(b.getSubtotal());
                net = net.add(b.getTotalAmount());
                tax = tax.add(b.getTaxAmount());
                disc = disc.add(b.getDiscountAmount());
                paid = paid.add(b.getPaidAmount());
            }

            list.add(new DailySalesDto(date, gross, net, tax, disc, paid, dateBills.size()));
        });

        return list;
    }

    @Transactional(readOnly = true)
    public List<HourlySalesDto> getHourlySales(String rawOutletId, LocalDate targetDate) {
        String outletId = resolveOutletId(rawOutletId);
        LocalDate date = (targetDate != null) ? targetDate : LocalDate.now();

        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(23, 59, 59);

        List<HourlySalesDto> hourlyTrend = new ArrayList<>(24);
        for (int h = 0; h < 24; h++) {
            String label = (h == 0) ? "12 AM" : (h < 12) ? h + " AM" : (h == 12) ? "12 PM" : (h - 12) + " PM";
            hourlyTrend.add(new HourlySalesDto(h, label, BigDecimal.ZERO, 0));
        }

        List<Bill> bills = billRepository.findByOutletIdAndCreatedAtBetweenOrderByCreatedAtAsc(outletId, start, end);
        for (Bill bill : bills) {
            if (bill.getStatus() == BillStatus.PAID) {
                int hour = bill.getCreatedAt().getHour();
                HourlySalesDto hDto = hourlyTrend.get(hour);
                hDto.setRevenue(hDto.getRevenue().add(bill.getPaidAmount()));
                hDto.setOrderCount(hDto.getOrderCount() + 1);
            }
        }

        return hourlyTrend;
    }

    @Transactional(readOnly = true)
    public List<PaymentMethodSummaryDto> getPaymentMethodBreakdown(String rawOutletId, LocalDateTime startDate, LocalDateTime endDate) {
        String outletId = resolveOutletId(rawOutletId);
        LocalDateTime start = (startDate != null) ? startDate : LocalDate.now().minusDays(30).atStartOfDay();
        LocalDateTime end = (endDate != null) ? endDate : LocalDate.now().atTime(23, 59, 59);

        List<Object[]> rows = paymentRepository.findPaymentMethodBreakdown(outletId, start, end);

        BigDecimal totalAll = BigDecimal.ZERO;
        for (Object[] row : rows) {
            if (row[2] != null) {
                totalAll = totalAll.add(toBigDecimal(row[2]));
            }
        }

        List<PaymentMethodSummaryDto> list = new ArrayList<>();
        for (Object[] row : rows) {
            PaymentMethod method = (PaymentMethod) row[0];
            long count = ((Number) row[1]).longValue();
            BigDecimal amount = toBigDecimal(row[2]);

            double pct = 0.0;
            if (totalAll.compareTo(BigDecimal.ZERO) > 0) {
                pct = amount.divide(totalAll, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue();
            }

            list.add(new PaymentMethodSummaryDto(method.name(), count, amount, pct));
        }

        return list;
    }

    @Transactional(readOnly = true)
    public List<OrderTypeSummaryDto> getOrderTypeBreakdown(String rawOutletId, LocalDateTime startDate, LocalDateTime endDate) {
        String outletId = resolveOutletId(rawOutletId);
        LocalDateTime start = (startDate != null) ? startDate : LocalDate.now().minusDays(30).atStartOfDay();
        LocalDateTime end = (endDate != null) ? endDate : LocalDate.now().atTime(23, 59, 59);

        List<Object[]> rows = orderRepository.findOrderTypeBreakdown(outletId, start, end);

        BigDecimal totalAll = BigDecimal.ZERO;
        for (Object[] row : rows) {
            if (row[2] != null) {
                totalAll = totalAll.add(toBigDecimal(row[2]));
            }
        }

        List<OrderTypeSummaryDto> list = new ArrayList<>();
        for (Object[] row : rows) {
            OrderType type = (OrderType) row[0];
            long count = ((Number) row[1]).longValue();
            BigDecimal amount = toBigDecimal(row[2]);

            double pct = 0.0;
            if (totalAll.compareTo(BigDecimal.ZERO) > 0) {
                pct = amount.divide(totalAll, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue();
            }

            list.add(new OrderTypeSummaryDto(type.name(), count, amount, pct));
        }

        return list;
    }

    @Transactional(readOnly = true)
    public List<TopSellingItemDto> getTopSellingItems(String rawOutletId, LocalDateTime startDate, LocalDateTime endDate, int limit) {
        String outletId = resolveOutletId(rawOutletId);
        LocalDateTime start = (startDate != null) ? startDate : LocalDate.now().minusDays(30).atStartOfDay();
        LocalDateTime end = (endDate != null) ? endDate : LocalDate.now().atTime(23, 59, 59);

        List<Object[]> rows = billItemRepository.findTopSellingItems(outletId, start, end);

        BigDecimal totalRevenue = BigDecimal.ZERO;
        for (Object[] r : rows) {
            if (r[4] != null) {
                totalRevenue = totalRevenue.add(toBigDecimal(r[4]));
            }
        }

        int maxLimit = limit > 0 ? limit : 10;
        List<TopSellingItemDto> list = new ArrayList<>();
        int count = 0;

        for (Object[] r : rows) {
            if (count++ >= maxLimit) break;

            String itemName = (String) r[0];
            String menuItemId = (String) r[1];
            String categoryName = (String) r[2];
            long quantity = ((Number) r[3]).longValue();
            BigDecimal revenue = toBigDecimal(r[4]);
            BigDecimal avgPrice = toBigDecimal(r[5]);

            TopSellingItemDto dto = new TopSellingItemDto(menuItemId, itemName, categoryName, quantity, revenue, avgPrice);
            if (totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
                double share = revenue.divide(totalRevenue, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue();
                dto.setRevenueSharePercentage(share);
            }
            list.add(dto);
        }

        return list;
    }

    @Transactional(readOnly = true)
    public List<CategorySalesDto> getCategorySales(String rawOutletId, LocalDateTime startDate, LocalDateTime endDate) {
        String outletId = resolveOutletId(rawOutletId);
        LocalDateTime start = (startDate != null) ? startDate : LocalDate.now().minusDays(30).atStartOfDay();
        LocalDateTime end = (endDate != null) ? endDate : LocalDate.now().atTime(23, 59, 59);

        List<Object[]> rows = billItemRepository.findCategorySales(outletId, start, end);

        BigDecimal totalAll = BigDecimal.ZERO;
        for (Object[] r : rows) {
            if (r[3] != null) {
                totalAll = totalAll.add(toBigDecimal(r[3]));
            }
        }

        List<CategorySalesDto> list = new ArrayList<>();
        for (Object[] r : rows) {
            String categoryId = (String) r[0];
            String categoryName = (String) r[1];
            long itemsSold = ((Number) r[2]).longValue();
            BigDecimal revenue = toBigDecimal(r[3]);

            CategorySalesDto dto = new CategorySalesDto(categoryId, categoryName, itemsSold, revenue);
            if (totalAll.compareTo(BigDecimal.ZERO) > 0) {
                double share = revenue.divide(totalAll, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue();
                dto.setRevenueSharePercentage(share);
            }
            list.add(dto);
        }

        return list;
    }

    @Transactional(readOnly = true)
    public List<InventoryConsumptionSummaryDto> getInventoryConsumption(String rawOutletId, LocalDateTime startDate, LocalDateTime endDate) {
        String outletId = resolveOutletId(rawOutletId);
        LocalDateTime start = (startDate != null) ? startDate : LocalDate.now().minusDays(30).atStartOfDay();
        LocalDateTime end = (endDate != null) ? endDate : LocalDate.now().atTime(23, 59, 59);

        List<Object[]> rows = inventoryTransactionRepository.findConsumptionByType(outletId, start, end);

        List<InventoryConsumptionSummaryDto> list = new ArrayList<>();
        for (Object[] r : rows) {
            InventoryTransactionType type = (InventoryTransactionType) r[0];
            long count = ((Number) r[1]).longValue();
            BigDecimal totalQty = toBigDecimal(r[2]);
            list.add(new InventoryConsumptionSummaryDto(type.name(), count, totalQty));
        }

        return list;
    }

    @Transactional(readOnly = true)
    public String exportSalesReportCsv(String rawOutletId, LocalDateTime startDate, LocalDateTime endDate) {
        String outletId = resolveOutletId(rawOutletId);
        LocalDateTime start = (startDate != null) ? startDate : LocalDate.now().minusDays(30).atStartOfDay();
        LocalDateTime end = (endDate != null) ? endDate : LocalDate.now().atTime(23, 59, 59);

        List<Bill> bills = billRepository.findByOutletIdAndCreatedAtBetweenOrderByCreatedAtAsc(outletId, start, end);

        StringBuilder sb = new StringBuilder();
        sb.append("Bill Number,Order Number,Order Type,Subtotal,Tax,Discount,Total Amount,Paid Amount,Balance Amount,Status,Date Time\n");

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        for (Bill b : bills) {
            String orderNum = b.getOrder() != null ? b.getOrder().getOrderNumber() : "N/A";
            String orderType = b.getOrder() != null ? b.getOrder().getOrderType().name() : "N/A";
            String dateStr = b.getCreatedAt() != null ? b.getCreatedAt().format(fmt) : "";

            sb.append(escapeCsv(b.getBillNumber())).append(",")
                    .append(escapeCsv(orderNum)).append(",")
                    .append(escapeCsv(orderType)).append(",")
                    .append(b.getSubtotal()).append(",")
                    .append(b.getTaxAmount()).append(",")
                    .append(b.getDiscountAmount()).append(",")
                    .append(b.getTotalAmount()).append(",")
                    .append(b.getPaidAmount()).append(",")
                    .append(b.getBalanceAmount()).append(",")
                    .append(b.getStatus().name()).append(",")
                    .append(escapeCsv(dateStr)).append("\n");
        }

        return sb.toString();
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
