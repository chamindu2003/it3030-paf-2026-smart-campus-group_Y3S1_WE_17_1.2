package com.SmartCampus.OperationHub.Service;

import com.SmartCampus.OperationHub.Model.Booking;
import com.SmartCampus.OperationHub.Repository.BookingRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;

    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    public Booking createBooking(Booking booking) {
        validateBookingForCreate(booking);

        boolean hasOverlap = !bookingRepository
                .findOverlappingBookings(
                        booking.getResourceId(),
                        booking.getBookingDate(),
                        booking.getStartTime(),
                        booking.getEndTime()
                )
                .isEmpty();

        if (hasOverlap) {
            throw new IllegalStateException("Booking conflicts with an existing booking");
        }

        booking.setId(null);
        booking.setStatus("PENDING");
        booking.setRejectionReason(null);
        return bookingRepository.save(booking);
    }

    /**
     * Admin-only status update.
     *
     * Allowed transitions:
     * - PENDING -> APPROVED
     * - PENDING -> REJECTED (requires rejectionReason)
     */
    public Booking updateStatus(Long bookingId, String newStatus, String rejectionReason, String actingRole) {
        if (!isAdmin(actingRole)) {
            throw new SecurityException("Only admins can update booking status");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        String currentStatus = normalizeStatus(booking.getStatus());
        String targetStatus = normalizeStatus(newStatus);

        if (!"PENDING".equals(currentStatus)) {
            throw new IllegalStateException("Only PENDING bookings can be updated");
        }

        if (!"APPROVED".equals(targetStatus) && !"REJECTED".equals(targetStatus)) {
            throw new IllegalArgumentException("Status must be APPROVED or REJECTED");
        }

        if ("REJECTED".equals(targetStatus)) {
            if (!StringUtils.hasText(rejectionReason)) {
                throw new IllegalArgumentException("Rejection reason is required");
            }
            booking.setRejectionReason(rejectionReason.trim());
            booking.setStatus("REJECTED");
            return bookingRepository.save(booking);
        }

        // APPROVED: enforce no conflicts with other APPROVED bookings
        boolean approvedOverlap = !bookingRepository
                .findOverlappingApprovedBookingsExcluding(
                        booking.getResourceId(),
                        booking.getBookingDate(),
                        booking.getStartTime(),
                        booking.getEndTime(),
                        booking.getId()
                )
                .isEmpty();

        if (approvedOverlap) {
            throw new IllegalStateException("Cannot approve: booking conflicts with an existing approved booking");
        }

        booking.setStatus("APPROVED");
        booking.setRejectionReason(null);
        return bookingRepository.save(booking);
    }

    public List<Booking> getBookingsForUser(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("userId is required");
        }
        return bookingRepository.findByUserIdOrderByBookingDateDescStartTimeDesc(userId);
    }

    /**
     * User cancellation.
     *
     * Allowed transitions:
     * - PENDING -> CANCELLED
     * - APPROVED -> CANCELLED
     */
    public Booking cancelBooking(Long bookingId, Long userId) {
        if (bookingId == null) {
            throw new IllegalArgumentException("bookingId is required");
        }
        if (userId == null) {
            throw new IllegalArgumentException("userId is required");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!userId.equals(booking.getUserId())) {
            throw new SecurityException("You can only cancel your own bookings");
        }

        String currentStatus = normalizeStatus(booking.getStatus());
        if (!"PENDING".equals(currentStatus) && !"APPROVED".equals(currentStatus)) {
            throw new IllegalStateException("Only PENDING or APPROVED bookings can be cancelled");
        }

        booking.setStatus("CANCELLED");
        booking.setRejectionReason(null);
        return bookingRepository.save(booking);
    }

    private void validateBookingForCreate(Booking booking) {
        if (booking == null) {
            throw new IllegalArgumentException("Booking is required");
        }
        if (booking.getResourceId() == null) {
            throw new IllegalArgumentException("resourceId is required");
        }
        if (booking.getUserId() == null) {
            throw new IllegalArgumentException("userId is required");
        }
        LocalDate date = booking.getBookingDate();
        LocalTime start = booking.getStartTime();
        LocalTime end = booking.getEndTime();

        if (date == null) {
            throw new IllegalArgumentException("bookingDate is required");
        }
        if (start == null || end == null) {
            throw new IllegalArgumentException("startTime and endTime are required");
        }
        if (!start.isBefore(end)) {
            throw new IllegalArgumentException("startTime must be before endTime");
        }
    }

    private boolean isAdmin(String role) {
        if (!StringUtils.hasText(role)) return false;
        return "ADMIN".equalsIgnoreCase(role.trim());
    }

    private String normalizeStatus(String status) {
        if (status == null) return "";
        return status.trim().toUpperCase(Locale.ROOT);
    }
}

