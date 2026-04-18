package com.SmartCampus.OperationHub.Controller;

import com.SmartCampus.OperationHub.DTO.NotificationDTO;
import com.SmartCampus.OperationHub.Service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")

public class NotificationController {

    private final NotificationService notificationService;

    // GET all notifications — Endpoint 1
    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getMyNotifications() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(
                notificationService.getNotificationsForUser(userId));
    }

    // GET unread count — Endpoint 2
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(
                Map.of("unreadCount", notificationService.getUnreadCount(userId)));
    }

    // PATCH mark one as read — Endpoint 3
    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable UUID id) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(
                notificationService.markAsRead(id, userId));
    }

    // PATCH mark all as read — Endpoint 4
    @PatchMapping("/read-all")
    public ResponseEntity<Map<String, Integer>> markAllAsRead() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(
                Map.of("markedRead", notificationService.markAllAsRead(userId)));
    }

    // DELETE one notification — Endpoint 5
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable UUID id) {
        Long userId = getCurrentUserId();
        notificationService.deleteNotification(id, userId);
        return ResponseEntity.noContent().build();
    }

    // Gets the logged-in user's ID from JWT
    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || auth.getName().isBlank() || "anonymousUser".equals(auth.getName())) {
            throw new AccessDeniedException("Unauthenticated");
        }

        // NOTE: This assumes Authentication.getName() contains a numeric userId.
        // If your JWT stores email as the subject (common), change this to look up the userId by email.
        return Long.parseLong(auth.getName());
    }




}
