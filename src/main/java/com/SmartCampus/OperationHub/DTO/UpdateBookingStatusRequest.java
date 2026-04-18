package com.SmartCampus.OperationHub.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateBookingStatusRequest {
    private String status; // APPROVED or REJECTED
    private String rejectionReason;
    private String actingRole; // must be ADMIN
}

