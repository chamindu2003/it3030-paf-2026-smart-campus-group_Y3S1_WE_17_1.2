package com.SmartCampus.OperationHub.DTO;

import com.SmartCampus.OperationHub.Enums.NotificationType;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {

    private UUID id;
    private Long recipientId;
    private NotificationType type;
    private String message;
    private Long referenceId;
    private boolean isRead;
    private LocalDateTime createdAt;
}
