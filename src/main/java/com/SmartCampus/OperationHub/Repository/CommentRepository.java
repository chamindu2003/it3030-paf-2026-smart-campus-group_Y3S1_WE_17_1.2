package com.SmartCampus.OperationHub.Repository;

import com.SmartCampus.OperationHub.Model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    // Spring Boot is so smart that just by naming this method correctly,
    // it will automatically write the SQL query to fetch comments by their ticket ID!
    List<Comment> findByTicketId(Long ticketId);
}