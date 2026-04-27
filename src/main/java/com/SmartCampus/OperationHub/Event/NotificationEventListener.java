package com.SmartCampus.OperationHub.Event;

import com.SmartCampus.OperationHub.DTO.CreateNotificationRequest;
import com.SmartCampus.OperationHub.Service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j

public class NotificationEventListener {

    private final NotificationService notificationService;

    @Async
    @EventListener
    public void handleNotificationEvent(NotificationEvent event) {
        log.info("Notification event received: type={}, recipient={}",
                event.type(), event.recipientId());

        notificationService.createNotification(
                CreateNotificationRequest.builder()
                        .recipientId(event.recipientId())
                        .type(event.type())
                        .message(event.message())
                        .referenceId(event.referenceId())
                        .build()
        );
    }
}
