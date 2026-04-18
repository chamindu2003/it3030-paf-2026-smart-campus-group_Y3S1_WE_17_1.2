package com.SmartCampus.OperationHub.DTO;

import com.SmartCampus.OperationHub.Enums.FacilityStatus;
import com.SmartCampus.OperationHub.Enums.FacilityType;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FacilityResponseDTO {
    private Long id;
    private String name;
    private FacilityType type;
    private Integer capacity;
    private String location;
    private String availabilityWindows;
    private FacilityStatus status;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}