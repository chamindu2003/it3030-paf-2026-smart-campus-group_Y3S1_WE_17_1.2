package com.SmartCampus.OperationHub.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TicketStatusNotificationRequest {

    @NotNull(message = "recipientId is required")
    private Long recipientId;

    @NotNull(message = "ticketId is required")
    private Long ticketId;

    @NotBlank(message = "status is required")
    private String status;
}
