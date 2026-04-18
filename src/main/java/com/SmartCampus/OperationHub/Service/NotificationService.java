package com.SmartCampus.OperationHub.Service;

import com.SmartCampus.OperationHub.DTO.CreateNotificationRequest;
import com.SmartCampus.OperationHub.DTO.NotificationDTO;
import com.SmartCampus.OperationHub.Enums.NotificationType;
import com.SmartCampus.OperationHub.Model.Booking;
import com.SmartCampus.OperationHub.Model.Notification;
import com.SmartCampus.OperationHub.Repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;

    @Transactional
    public NotificationDTO notifyBookingApproved(Booking booking) {
    return createNotification(CreateNotificationRequest.builder()
        .recipientId(booking.getUserId())
        .type(NotificationType.BOOKING_APPROVED)
        .message("Booking #" + booking.getId() + " has been approved.")
        .referenceId(booking.getId())
        .build());
    }

    @Transactional
    public NotificationDTO notifyBookingRejected(Booking booking) {
    String reason = booking.getRejectionReason() == null || booking.getRejectionReason().isBlank()
        ? "No reason provided"
        : booking.getRejectionReason().trim();

    return createNotification(CreateNotificationRequest.builder()
        .recipientId(booking.getUserId())
        .type(NotificationType.BOOKING_REJECTED)
        .message("Booking #" + booking.getId() + " was rejected. Reason: " + reason)
        .referenceId(booking.getId())
        .build());
    }

    @Transactional
    public NotificationDTO notifyTicketStatusChanged(Long recipientId, Long ticketId, String newStatus) {
    return createNotification(CreateNotificationRequest.builder()
        .recipientId(recipientId)
        .type(NotificationType.TICKET_STATUS_CHANGED)
        .message("Ticket #" + ticketId + " status changed to " + newStatus + ".")
        .referenceId(ticketId)
        .build());
    }

    @Transactional
    public NotificationDTO notifyTicketComment(Long recipientId, Long ticketId, String commenterName) {
    String commenter = (commenterName == null || commenterName.isBlank())
        ? "A team member"
        : commenterName.trim();

    return createNotification(CreateNotificationRequest.builder()
        .recipientId(recipientId)
        .type(NotificationType.NEW_COMMENT)
        .message(commenter + " commented on ticket #" + ticketId + ".")
        .referenceId(ticketId)
        .build());
    }

    @Transactional
    public NotificationDTO createNotification(CreateNotificationRequest request) {
        Notification notification = Notification.builder()
                .recipientId(request.getRecipientId())
                .type(request.getType())
                .message(request.getMessage())
                .referenceId(request.getReferenceId())
                .isRead(false)
                .build();
        return toDTO(notificationRepository.save(notification));
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> getNotificationsForUser(Long userId) {
        return notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndIsRead(userId, false);
    }

    @Transactional
    public NotificationDTO markAsRead(UUID notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException(
                        "Notification not found: " + notificationId));

        if (!notification.getRecipientId().equals(userId)) {
            throw new AccessDeniedException("Access denied");
        }

        notification.setRead(true);
        return toDTO(notificationRepository.save(notification));
    }

    @Transactional
    public int markAllAsRead(Long userId) {
        return notificationRepository.markAllReadByRecipientId(userId);
    }

    @Transactional
    public void deleteNotification(UUID notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException(
                        "Notification not found: " + notificationId));

        if (!notification.getRecipientId().equals(userId)) {
            throw new AccessDeniedException("Access denied");
        }

        notificationRepository.delete(notification);
    }

    private NotificationDTO toDTO(Notification n) {
        return NotificationDTO.builder()
                .id(n.getId())
                .recipientId(n.getRecipientId())
                .type(n.getType())
                .message(n.getMessage())
                .referenceId(n.getReferenceId())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
