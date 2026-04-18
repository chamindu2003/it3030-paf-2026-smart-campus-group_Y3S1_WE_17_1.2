package com.SmartCampus.OperationHub.Repository;

import com.SmartCampus.OperationHub.Model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    // Spring Boot will automatically write the SQL query to fetch comments
    // based on the ID of the associated Ticket entity!
    List<Comment> findByTicketId(Long ticketId);
}