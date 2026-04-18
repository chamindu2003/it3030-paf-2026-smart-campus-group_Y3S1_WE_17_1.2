package com.SmartCampus.OperationHub.Event;

import com.SmartCampus.OperationHub.Enums.NotificationType;

/**
 * Domain event describing a notification to be created/delivered.
 */
public record NotificationEvent(
        Long recipientId,
        NotificationType type,
        String message,
        Long referenceId
) {
}
