package com.SmartCampus.OperationHub.DTO;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TicketCommentNotificationRequest {

    @NotNull(message = "recipientId is required")
    private Long recipientId;

    @NotNull(message = "ticketId is required")
    private Long ticketId;

    private String commenterName;
}
