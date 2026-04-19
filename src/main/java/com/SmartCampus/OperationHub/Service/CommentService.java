package com.SmartCampus.OperationHub.Service;

import com.SmartCampus.OperationHub.Model.Comment;
import com.SmartCampus.OperationHub.Model.Ticket;
import com.SmartCampus.OperationHub.Repository.CommentRepository;
import com.SmartCampus.OperationHub.Repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    // We need the TicketRepository to find the ticket object
    @Autowired
    private TicketRepository ticketRepository;

    // Method to save a new comment
    public Comment addComment(Long ticketId, Comment comment) {
        // 1. Find the actual Ticket object in the database
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        // 2. Attach the full Ticket object to the comment, instead of just the ID
        comment.setTicket(ticket);

        // 3. Save to database
        return commentRepository.save(comment);
    }

    // Method to fetch all comments for a specific ticket (we will need this for the frontend!)
    public List<Comment> getCommentsByTicketId(Long ticketId) {
        return commentRepository.findByTicketId(ticketId);
    }
}