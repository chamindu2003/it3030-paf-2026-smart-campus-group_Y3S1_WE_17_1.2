package com.SmartCampus.OperationHub.Service;

import com.SmartCampus.OperationHub.DTO.FacilityRequestDTO;
import com.SmartCampus.OperationHub.DTO.FacilityResponseDTO;
import com.SmartCampus.OperationHub.Enums.FacilityStatus;
import com.SmartCampus.OperationHub.Enums.FacilityType;
import com.SmartCampus.OperationHub.Model.Facility;
import com.SmartCampus.OperationHub.Repository.FacilityRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FacilityServiceImpl implements FacilityService {

    private final FacilityRepository facilityRepository;
    private final NotificationService notificationService;

    public FacilityServiceImpl(FacilityRepository facilityRepository) {
        this.facilityRepository = facilityRepository;
    }

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
        Facility saved = facilityRepository.save(facility);
        notificationService.notifyFacilityCreated(saved.getId(), saved.getName());
        return toResponseDTO(saved);
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
        Facility saved = facilityRepository.save(facility);
        notificationService.notifyFacilityUpdated(saved.getId(), saved.getName());
        return toResponseDTO(saved);
    }

    // UPDATE STATUS ONLY
    @Override
    public FacilityResponseDTO updateStatus(Long id, FacilityStatus status) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facility not found with id: " + id));
        facility.setStatus(status);
        Facility saved = facilityRepository.save(facility);
        notificationService.notifyFacilityStatusChanged(saved.getId(), saved.getName(), saved.getStatus().name());
        return toResponseDTO(saved);
    }

    // DELETE
    @Override
    public void delete(Long id) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facility not found with id: " + id));
        facilityRepository.delete(facility);
        notificationService.notifyFacilityDeleted(facility.getId(), facility.getName());
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