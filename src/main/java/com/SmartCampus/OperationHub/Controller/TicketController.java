package com.SmartCampus.OperationHub.Controller;

import com.SmartCampus.OperationHub.Model.Ticket;
import com.SmartCampus.OperationHub.Model.TicketStatus;
import com.SmartCampus.OperationHub.Service.TicketService;
import com.SmartCampus.OperationHub.Service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
// REMOVED @CrossOrigin entirely. Let SecurityConfig handle it!
public class TicketController {

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private TicketService ticketService;

    @PostMapping
    public ResponseEntity<Ticket> createTicket(@RequestBody Ticket ticket) {
        Ticket savedTicket = ticketService.createTicket(ticket);
        return new ResponseEntity<>(savedTicket, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets() {
        List<Ticket> tickets = ticketService.getAllTickets();
        return new ResponseEntity<>(tickets, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable Long id) {
        Ticket ticket = ticketService.getTicketById(id);
        return new ResponseEntity<>(ticket, HttpStatus.OK);
    }

    @GetMapping("/assigned/{assigneeId}")
    public ResponseEntity<List<Ticket>> getAssignedTickets(@PathVariable Long assigneeId) {
        List<Ticket> tickets = ticketService.getTicketsByAssignee(assigneeId);
        return new ResponseEntity<>(tickets, HttpStatus.OK);
    }

    // UPDATED: Now perfectly handles the JSON { "status": "IN_PROGRESS" } from React
    @PutMapping("/{id}/status")
    public ResponseEntity<Ticket> updateTicketStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {

        String statusStr = payload.get("status");
        TicketStatus status = TicketStatus.valueOf(statusStr.toUpperCase());
        Ticket updatedTicket = ticketService.updateTicketStatus(id, status);
        return new ResponseEntity<>(updatedTicket, HttpStatus.OK);
    }

    // NEW: Endpoint to handle Technician assignment from the Admin view
    @PutMapping("/{id}/assign")
    public ResponseEntity<Ticket> assignTechnician(
            @PathVariable Long id,
            @RequestBody Map<String, Long> payload) {

        // Convert integer/number from JSON map to Long safely
        Number assigneeNum = payload.get("assigneeId");
        Long assigneeId = assigneeNum != null ? assigneeNum.longValue() : null;

        Ticket updatedTicket = ticketService.assignTechnician(id, assigneeId);
        return new ResponseEntity<>(updatedTicket, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/{id}/upload")
    public ResponseEntity<Ticket> uploadFileToTicket(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        try {
            String fileName = fileStorageService.storeFile(file);
            Ticket savedTicket = ticketService.updateTicketAttachment(id, fileName);
            return new ResponseEntity<>(savedTicket, HttpStatus.OK);
        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}