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

//request DTO for the updateStatus endpoint in BookingController, which allows an admin to approve or reject a booking. It includes the new status, an optional rejection reason (required if rejecting), and the role of the user making the request (which must be ADMIN).