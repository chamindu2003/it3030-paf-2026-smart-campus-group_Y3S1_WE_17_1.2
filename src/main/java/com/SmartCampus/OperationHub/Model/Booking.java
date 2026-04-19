package com.SmartCampus.OperationHub.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.Data;

@Entity
@Table(name = "bookings")
@Data
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Foreign key to facilities.id. The raw Long value is what the REST API
     * accepts/returns; the @ManyToOne gives JPA the FK relationship and
     * enforces referential integrity at the database level.
     */
    @Column(name = "resource_id", nullable = false)
    private Long resourceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id", insertable = false, updatable = false)
    @JsonIgnore
    private Facility facility;

    private Long userId;     // Links to the user who booked
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;

    private String status = "PENDING"; // Default status
    private String rejectionReason;
}

