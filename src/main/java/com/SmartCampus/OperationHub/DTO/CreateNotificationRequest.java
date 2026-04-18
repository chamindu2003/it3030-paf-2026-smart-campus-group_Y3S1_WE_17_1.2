package com.SmartCampus.OperationHub.DTO;

import com.SmartCampus.OperationHub.Enums.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class CreateNotificationRequest {

    @NotNull(message = "recipientId is required")
    private Long recipientId;

    @NotNull(message = "type is required")
    private NotificationType type;

    @NotBlank(message = "message is required")
    private String message;

    private Long referenceId;
}
