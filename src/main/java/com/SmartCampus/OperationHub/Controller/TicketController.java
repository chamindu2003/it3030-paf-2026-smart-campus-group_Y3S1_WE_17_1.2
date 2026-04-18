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

    @PutMapping("/{id}/status")
    public ResponseEntity<Ticket> updateTicketStatus(
            @PathVariable Long id,
            @RequestParam TicketStatus status) {

        Ticket updatedTicket = ticketService.updateTicketStatus(id, status);
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