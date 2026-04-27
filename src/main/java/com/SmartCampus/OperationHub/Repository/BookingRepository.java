package com.SmartCampus.OperationHub.Repository;

import com.SmartCampus.OperationHub.Model.Booking;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserIdOrderByBookingDateDescStartTimeDesc(Long userId);

    @Query(
            "SELECT b FROM Booking b " +
            "WHERE (:userId IS NULL OR b.userId = :userId) " +
            "AND (:resourceId IS NULL OR b.resourceId = :resourceId) " +
            "AND (:status IS NULL OR UPPER(TRIM(b.status)) = UPPER(TRIM(:status))) " +
            "ORDER BY b.bookingDate DESC, b.startTime DESC"
    )
    List<Booking> searchBookings(Long userId, Long resourceId, String status);

    @Query(
            "SELECT b FROM Booking b " +
            "WHERE b.resourceId = :resId AND b.bookingDate = :date " +
            "AND b.status IN ('PENDING', 'APPROVED') " +
            "AND (b.startTime < :end AND b.endTime > :start)"
    )
    List<Booking> findOverlappingBookings(Long resId, LocalDate date, LocalTime start, LocalTime end);

    @Query(
            "SELECT b FROM Booking b " +
            "WHERE b.resourceId = :resId AND b.bookingDate = :date " +
            "AND b.status = 'APPROVED' " +
            "AND b.id <> :excludeId " +
            "AND (b.startTime < :end AND b.endTime > :start)"
    )
    List<Booking> findOverlappingApprovedBookingsExcluding(
            Long resId,
            LocalDate date,
            LocalTime start,
            LocalTime end,
            Long excludeId
    );
}