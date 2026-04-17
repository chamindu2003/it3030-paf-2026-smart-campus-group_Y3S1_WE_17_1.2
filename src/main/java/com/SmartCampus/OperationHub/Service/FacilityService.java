package com.SmartCampus.OperationHub.Service;

import com.SmartCampus.OperationHub.DTO.FacilityRequestDTO;
import com.SmartCampus.OperationHub.DTO.FacilityResponseDTO;
import com.SmartCampus.OperationHub.Enums.FacilityStatus;
import com.SmartCampus.OperationHub.Enums.FacilityType;
import java.util.List;

public interface FacilityService {
    List<FacilityResponseDTO> getAll(FacilityType type, Integer minCapacity, String location);
    FacilityResponseDTO getById(Long id);
    FacilityResponseDTO create(FacilityRequestDTO dto);
    FacilityResponseDTO update(Long id, FacilityRequestDTO dto);
    FacilityResponseDTO updateStatus(Long id, FacilityStatus status);
    void delete(Long id);
}