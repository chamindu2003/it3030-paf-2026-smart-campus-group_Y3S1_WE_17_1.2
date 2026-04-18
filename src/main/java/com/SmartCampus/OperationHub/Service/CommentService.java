package com.SmartCampus.OperationHub.Service;

import com.SmartCampus.OperationHub.Model.Comment;
import com.SmartCampus.OperationHub.Repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    // Method to save a new comment
    public Comment addComment(Long ticketId, Comment comment) {
        // We force the ticketId from the URL into the comment to ensure it attaches to the right ticket
        comment.setTicketId(ticketId);
        return commentRepository.save(comment);
    }

    // Method to fetch all comments for a specific ticket (we will need this for the frontend!)
    public List<Comment> getCommentsByTicketId(Long ticketId) {
        return commentRepository.findByTicketId(ticketId);
    }
}