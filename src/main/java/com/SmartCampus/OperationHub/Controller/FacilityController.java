package com.SmartCampus.OperationHub.Controller;

import com.SmartCampus.OperationHub.DTO.FacilityRequestDTO;
import com.SmartCampus.OperationHub.DTO.FacilityResponseDTO;
import com.SmartCampus.OperationHub.Enums.FacilityStatus;
import com.SmartCampus.OperationHub.Enums.FacilityType;
import com.SmartCampus.OperationHub.Service.FacilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/facilities")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FacilityController {

    private final FacilityService facilityService;

    // GET all + search/filter
    @GetMapping
    public ResponseEntity<List<FacilityResponseDTO>> getAll(
            @RequestParam(required = false) FacilityType type,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String location) {
        return ResponseEntity.ok(facilityService.getAll(type, minCapacity, location));
    }

    // GET one by ID
    @GetMapping("/{id}")
    public ResponseEntity<FacilityResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(facilityService.getById(id));
    }

    // POST - create new facility
    @PostMapping
    public ResponseEntity<FacilityResponseDTO> create(@Valid @RequestBody FacilityRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(facilityService.create(dto));
    }

    // PUT - update facility
    @PutMapping("/{id}")
    public ResponseEntity<FacilityResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody FacilityRequestDTO dto) {
        return ResponseEntity.ok(facilityService.update(id, dto));
    }

    // PATCH - update status only
    @PatchMapping("/{id}/status")
    public ResponseEntity<FacilityResponseDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam FacilityStatus status) {
        return ResponseEntity.ok(facilityService.updateStatus(id, status));
    }

    // DELETE - remove facility
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        facilityService.delete(id);
        return ResponseEntity.noContent().build();
    }
}