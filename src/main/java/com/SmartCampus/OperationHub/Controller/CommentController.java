package com.SmartCampus.OperationHub.Controller;

import com.SmartCampus.OperationHub.Model.Comment;
import com.SmartCampus.OperationHub.Service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
// We nest the comments under the specific ticket ID in the URL
@RequestMapping("/api/tickets/{ticketId}/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    // Endpoint 1: Add a Comment (POST)
    @PostMapping
    public ResponseEntity<Comment> addComment(
            @PathVariable Long ticketId,
            @RequestBody Comment comment) {

        Comment savedComment = commentService.addComment(ticketId, comment);
        return new ResponseEntity<>(savedComment, HttpStatus.CREATED);
    }

    // Endpoint 2: Get all Comments for a Ticket (GET)
    @GetMapping
    public ResponseEntity<List<Comment>> getComments(@PathVariable Long ticketId) {
        List<Comment> comments = commentService.getCommentsByTicketId(ticketId);
        return new ResponseEntity<>(comments, HttpStatus.OK);
    }
}