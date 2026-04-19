package com.SmartCampus.OperationHub.Service;

import com.SmartCampus.OperationHub.DTO.CreateNotificationRequest;
import com.SmartCampus.OperationHub.DTO.NotificationDTO;
import com.SmartCampus.OperationHub.Enums.NotificationType;
import com.SmartCampus.OperationHub.Model.Booking;
import com.SmartCampus.OperationHub.Model.Notification;
import com.SmartCampus.OperationHub.Model.Ticket;
import com.SmartCampus.OperationHub.Model.UserModel;
import com.SmartCampus.OperationHub.Repository.NotificationRepository;
import com.SmartCampus.OperationHub.Repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepo userRepo;

    @Transactional
    public NotificationDTO notifyBookingSubmitted(Booking booking) {
        NotificationDTO latest = createNotification(CreateNotificationRequest.builder()
                .recipientId(booking.getUserId())
                .type(NotificationType.BOOKING_SUBMITTED)
                .message("Booking #" + booking.getId() + " has been submitted and is pending approval.")
                .referenceId(booking.getId())
                .build());

        notifyAdmins(
                NotificationType.BOOKING_SUBMITTED,
                "New booking request #" + booking.getId() + " is pending review.",
                booking.getId(),
                null
        );

        return latest;
    }

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
        public NotificationDTO notifyBookingCancelled(Booking booking) {
        NotificationDTO latest = createNotification(CreateNotificationRequest.builder()
            .recipientId(booking.getUserId())
            .type(NotificationType.BOOKING_CANCELLED)
            .message("Booking #" + booking.getId() + " has been cancelled.")
            .referenceId(booking.getId())
            .build());

        notifyAdmins(
            NotificationType.BOOKING_CANCELLED,
            "Booking #" + booking.getId() + " was cancelled by the requester.",
            booking.getId(),
            null
        );

        return latest;
        }

        @Transactional
        public NotificationDTO notifyTicketCreated(Ticket ticket) {
        NotificationDTO latest = createNotification(CreateNotificationRequest.builder()
            .recipientId(ticket.getUserId())
            .type(NotificationType.TICKET_CREATED)
            .message("Ticket #" + ticket.getId() + " has been created.")
            .referenceId(ticket.getId())
            .build());

        notifyAdmins(
            NotificationType.TICKET_CREATED,
            "New ticket #" + ticket.getId() + " was reported.",
            ticket.getId(),
            null
        );

        return latest;
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
        public NotificationDTO notifyTicketAssigned(Long recipientId, Long ticketId) {
        return createNotification(CreateNotificationRequest.builder()
            .recipientId(recipientId)
            .type(NotificationType.TICKET_ASSIGNED)
            .message("You have been assigned to ticket #" + ticketId + ".")
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
        public void notifyFacilityCreated(Long facilityId, String facilityName) {
        notifyAllUsers(
            NotificationType.FACILITY_CREATED,
            "New facility added: " + safeFacilityName(facilityName) + " (#" + facilityId + ").",
            facilityId
        );
        }

        @Transactional
        public void notifyFacilityUpdated(Long facilityId, String facilityName) {
        notifyAllUsers(
            NotificationType.FACILITY_UPDATED,
            "Facility updated: " + safeFacilityName(facilityName) + " (#" + facilityId + ").",
            facilityId
        );
        }

        @Transactional
        public void notifyFacilityStatusChanged(Long facilityId, String facilityName, String status) {
        notifyAllUsers(
            NotificationType.FACILITY_STATUS_CHANGED,
            "Facility " + safeFacilityName(facilityName) + " (#" + facilityId + ") is now " +
                String.valueOf(status).toUpperCase(Locale.ROOT) + ".",
            facilityId
        );
        }

        @Transactional
        public void notifyFacilityDeleted(Long facilityId, String facilityName) {
        notifyAllUsers(
            NotificationType.FACILITY_DELETED,
            "Facility removed: " + safeFacilityName(facilityName) + " (#" + facilityId + ").",
            facilityId
        );
        }

        @Transactional
        public void notifyUserRegistered(UserModel user) {
        if (user == null || user.getId() == null) {
            return;
        }

        createNotification(CreateNotificationRequest.builder()
            .recipientId(user.getId())
            .type(NotificationType.USER_REGISTERED)
            .message("Welcome to Smart Campus Hub. Your account has been created successfully.")
            .referenceId(user.getId())
            .build());

        notifyAdmins(
            NotificationType.USER_REGISTERED,
            "New user registered: " + safeName(user.getName()) + " (" + user.getEmail() + ").",
            user.getId(),
            user.getId()
        );
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

    private void notifyAdmins(NotificationType type, String message, Long referenceId, Long excludeRecipientId) {
        List<Long> adminIds = userRepo.findAll().stream()
                .filter(user -> "ADMIN".equalsIgnoreCase(safeRole(user.getRole())))
                .map(UserModel::getId)
                .filter(Objects::nonNull)
                .filter(id -> excludeRecipientId == null || !excludeRecipientId.equals(id))
                .toList();

        for (Long adminId : adminIds) {
            createNotification(CreateNotificationRequest.builder()
                    .recipientId(adminId)
                    .type(type)
                    .message(message)
                    .referenceId(referenceId)
                    .build());
        }
    }

    private void notifyAllUsers(NotificationType type, String message, Long referenceId) {
        List<Long> recipientIds = new ArrayList<>();
        for (UserModel user : userRepo.findAll()) {
            if (user.getId() != null) {
                recipientIds.add(user.getId());
            }
        }

        for (Long recipientId : recipientIds) {
            createNotification(CreateNotificationRequest.builder()
                    .recipientId(recipientId)
                    .type(type)
                    .message(message)
                    .referenceId(referenceId)
                    .build());
        }
    }

    private String safeRole(String role) {
        return role == null ? "" : role.trim();
    }

    private String safeFacilityName(String name) {
        return (name == null || name.isBlank()) ? "Unnamed Facility" : name.trim();
    }

    private String safeName(String name) {
        return (name == null || name.isBlank()) ? "Unknown User" : name.trim();
    }
}
