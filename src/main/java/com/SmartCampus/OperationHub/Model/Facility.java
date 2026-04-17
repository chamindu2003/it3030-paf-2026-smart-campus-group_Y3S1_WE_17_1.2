package com.SmartCampus.OperationHub.Model;

import com.SmartCampus.OperationHub.Enums.FacilityStatus;
import com.SmartCampus.OperationHub.Enums.FacilityType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "facilities")
@Data
@NoArgsConstructor
public class Facility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "Type is required")
    private FacilityType type;

    private Integer capacity;

    @NotBlank(message = "Location is required")
    private String location;

    private String availabilityWindows;

    @Enumerated(EnumType.STRING)
    private FacilityStatus status = FacilityStatus.ACTIVE;

    private String description;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}