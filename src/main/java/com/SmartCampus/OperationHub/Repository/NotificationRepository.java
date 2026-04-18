package com.SmartCampus.OperationHub.Repository;

import com.SmartCampus.OperationHub.Model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    long countByRecipientIdAndIsRead(Long recipientId, boolean isRead);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true " +
            "WHERE n.recipientId = :recipientId AND n.isRead = false")
    int markAllReadByRecipientId(Long recipientId);

}
