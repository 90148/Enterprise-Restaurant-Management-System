package com.example.restaurant.service;

import com.example.restaurant.dto.inventory.RefundDto;
import com.example.restaurant.dto.inventory.RefundRequest;
import com.example.restaurant.entity.*;
import com.example.restaurant.exception.BusinessException;
import com.example.restaurant.exception.ResourceNotFoundException;
import com.example.restaurant.repository.BillRepository;
import com.example.restaurant.repository.PaymentRepository;
import com.example.restaurant.repository.RefundRepository;
import com.example.restaurant.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RefundService {

    private final RefundRepository refundRepository;
    private final PaymentRepository paymentRepository;
    private final BillRepository billRepository;
    private final UserRepository userRepository;

    public RefundService(RefundRepository refundRepository,
                         PaymentRepository paymentRepository,
                         BillRepository billRepository,
                         UserRepository userRepository) {
        this.refundRepository = refundRepository;
        this.paymentRepository = paymentRepository;
        this.billRepository = billRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public RefundDto processRefund(RefundRequest request, String currentUsername) {
        Payment payment = paymentRepository.findById(request.getPaymentId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", request.getPaymentId()));

        if (payment.getStatus() == PaymentStatus.REFUNDED) {
            throw new BusinessException("Payment has already been refunded");
        }

        if (request.getAmount().compareTo(payment.getAmount()) > 0) {
            throw new BusinessException("Refund amount (" + request.getAmount() + ") cannot exceed original payment amount (" + payment.getAmount() + ")");
        }

        User createdBy = null;
        if (currentUsername != null) {
            createdBy = userRepository.findByUsername(currentUsername).orElse(null);
        }

        RefundTransaction refund = new RefundTransaction(
                UUID.randomUUID().toString(),
                payment,
                request.getAmount(),
                request.getReason(),
                createdBy
        );

        // Update payment status
        payment.setStatus(PaymentStatus.REFUNDED);
        paymentRepository.save(payment);

        // Adjust bill ledger
        Bill bill = payment.getBill();
        if (bill != null) {
            BigDecimal newPaid = bill.getPaidAmount().subtract(request.getAmount());
            if (newPaid.compareTo(BigDecimal.ZERO) < 0) {
                newPaid = BigDecimal.ZERO;
            }
            BigDecimal newBalance = bill.getTotalAmount().subtract(newPaid);
            bill.setPaidAmount(newPaid);
            bill.setBalanceAmount(newBalance);

            if (newPaid.compareTo(BigDecimal.ZERO) == 0) {
                bill.setStatus(BillStatus.UNPAID);
            } else if (newBalance.compareTo(BigDecimal.ZERO) > 0) {
                bill.setStatus(BillStatus.PARTIALLY_PAID);
            }
            billRepository.save(bill);
        }

        RefundTransaction savedRefund = refundRepository.save(refund);
        return mapToDto(savedRefund);
    }

    @Transactional(readOnly = true)
    public List<RefundDto> getRefundsByOutlet(String outletId) {
        return refundRepository.findByPaymentBillOutletIdOrderByCreatedAtDesc(outletId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RefundDto> getRefundsByPayment(String paymentId) {
        return refundRepository.findByPaymentId(paymentId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public RefundDto mapToDto(RefundTransaction r) {
        String createdByName = r.getCreatedBy() != null
                ? r.getCreatedBy().getFullName()
                : "System";

        String billId = r.getPayment() != null && r.getPayment().getBill() != null
                ? r.getPayment().getBill().getId() : null;
        String billNumber = r.getPayment() != null && r.getPayment().getBill() != null
                ? r.getPayment().getBill().getBillNumber() : null;
        String paymentMethod = r.getPayment() != null && r.getPayment().getPaymentMethod() != null
                ? r.getPayment().getPaymentMethod().name() : null;

        return new RefundDto(
                r.getId(),
                r.getPayment().getId(),
                billId,
                billNumber,
                r.getAmount(),
                paymentMethod,
                r.getReason(),
                r.getStatus(),
                createdByName,
                r.getCreatedAt()
        );
    }
}
