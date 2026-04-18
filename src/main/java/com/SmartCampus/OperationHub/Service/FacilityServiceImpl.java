package com.SmartCampus.OperationHub.Service;

import com.SmartCampus.OperationHub.DTO.FacilityRequestDTO;
import com.SmartCampus.OperationHub.DTO.FacilityResponseDTO;
import com.SmartCampus.OperationHub.Enums.FacilityStatus;
import com.SmartCampus.OperationHub.Enums.FacilityType;
import com.SmartCampus.OperationHub.Model.Facility;
import com.SmartCampus.OperationHub.Repository.FacilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FacilityServiceImpl implements FacilityService {

    private final FacilityRepository facilityRepository;

    // GET ALL (with filters)
    @Override
    public List<FacilityResponseDTO> getAll(FacilityType type, Integer minCapacity, String location) {
        return facilityRepository.findWithFilters(type, minCapacity, location)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    // GET ONE BY ID
    @Override
    public FacilityResponseDTO getById(Long id) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facility not found with id: " + id));
        return toResponseDTO(facility);
    }

    // CREATE NEW
    @Override
    public FacilityResponseDTO create(FacilityRequestDTO dto) {
        Facility facility = toEntity(dto);
        return toResponseDTO(facilityRepository.save(facility));
    }

    // UPDATE EXISTING
    @Override
    public FacilityResponseDTO update(Long id, FacilityRequestDTO dto) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facility not found with id: " + id));
        facility.setName(dto.getName());
        facility.setType(dto.getType());
        facility.setCapacity(dto.getCapacity());
        facility.setLocation(dto.getLocation());
        facility.setAvailabilityWindows(dto.getAvailabilityWindows());
        facility.setDescription(dto.getDescription());
        if (dto.getStatus() != null) facility.setStatus(dto.getStatus());
        return toResponseDTO(facilityRepository.save(facility));
    }

    // UPDATE STATUS ONLY
    @Override
    public FacilityResponseDTO updateStatus(Long id, FacilityStatus status) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facility not found with id: " + id));
        facility.setStatus(status);
        return toResponseDTO(facilityRepository.save(facility));
    }

    // DELETE
    @Override
    public void delete(Long id) {
        if (!facilityRepository.existsById(id)) {
            throw new RuntimeException("Facility not found with id: " + id);
        }
        facilityRepository.deleteById(id);
    }

    // ── Helper: Model → ResponseDTO ──────────────
    private FacilityResponseDTO toResponseDTO(Facility f) {
        FacilityResponseDTO dto = new FacilityResponseDTO();
        dto.setId(f.getId());
        dto.setName(f.getName());
        dto.setType(f.getType());
        dto.setCapacity(f.getCapacity());
        dto.setLocation(f.getLocation());
        dto.setAvailabilityWindows(f.getAvailabilityWindows());
        dto.setStatus(f.getStatus());
        dto.setDescription(f.getDescription());
        dto.setCreatedAt(f.getCreatedAt());
        dto.setUpdatedAt(f.getUpdatedAt());
        return dto;
    }

    // ── Helper: RequestDTO → Model ────────────────
    private Facility toEntity(FacilityRequestDTO dto) {
        Facility f = new Facility();
        f.setName(dto.getName());
        f.setType(dto.getType());
        f.setCapacity(dto.getCapacity());
        f.setLocation(dto.getLocation());
        f.setAvailabilityWindows(dto.getAvailabilityWindows());
        f.setDescription(dto.getDescription());
        f.setStatus(dto.getStatus() != null ? dto.getStatus() : FacilityStatus.ACTIVE);
        return f;
    }
}