package com.SmartCampus.OperationHub.DTO;

import com.SmartCampus.OperationHub.Enums.FacilityStatus;
import com.SmartCampus.OperationHub.Enums.FacilityType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FacilityRequestDTO {

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Type is required")
    private FacilityType type;

    private Integer capacity;

    @NotBlank(message = "Location is required")
    private String location;

    private String availabilityWindows;

    private FacilityStatus status;

    private String description;
}