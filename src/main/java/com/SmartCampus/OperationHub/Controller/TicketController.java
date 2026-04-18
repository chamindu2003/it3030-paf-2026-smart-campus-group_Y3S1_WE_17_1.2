package com.SmartCampus.OperationHub.Controller;

import com.SmartCampus.OperationHub.Model.Ticket;
import com.SmartCampus.OperationHub.Model.TicketStatus;
import com.SmartCampus.OperationHub.Service.TicketService;
import com.SmartCampus.OperationHub.Service.FileStorageService; // <-- Added missing import
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile; // <-- Added missing import

import java.io.IOException; // <-- Added missing import
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*") // Allows your React frontend to connect later without CORS errors
public class TicketController {

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private TicketService ticketService;

    // Endpoint 1: Create a Ticket (POST)
    @PostMapping
    public ResponseEntity<Ticket> createTicket(@RequestBody Ticket ticket) {
        Ticket savedTicket = ticketService.createTicket(ticket);
        // Returns the saved ticket and a "201 Created" HTTP status code
        return new ResponseEntity<>(savedTicket, HttpStatus.CREATED);
    }

    // Endpoint 2: Get All Tickets (GET)
    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets() {
        List<Ticket> tickets = ticketService.getAllTickets();
        // Returns the list of tickets and a "200 OK" HTTP status code
        return new ResponseEntity<>(tickets, HttpStatus.OK);
    }

    // Endpoint 3: Update Ticket Status (PUT)
    @PutMapping("/{id}/status")
    public ResponseEntity<Ticket> updateTicketStatus(
            @PathVariable Long id,
            @RequestParam TicketStatus status) {

        Ticket updatedTicket = ticketService.updateTicketStatus(id, status);
        // Returns the updated ticket and a "200 OK" status code
        return new ResponseEntity<>(updatedTicket, HttpStatus.OK);
    }

    // Endpoint 4: Delete a Ticket (DELETE)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        // Returns a "204 No Content" status code, which is the standard success code for a deletion
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // Endpoint 5: Upload an Attachment to a Ticket (POST)
    @PostMapping("/{id}/upload")
    public ResponseEntity<Ticket> uploadFileToTicket(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        try {
            // 1. Save the file to the folder and get the unique name
            String fileName = fileStorageService.storeFile(file);

            // 2. Find the existing ticket
            Ticket ticket = ticketService.getAllTickets().stream()
                    .filter(t -> t.getId().equals(id))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Ticket not found"));

            // 3. Update the ticket with the file name
            ticket.setAttachmentUrl(fileName);

            // 4. Save the updated ticket back to the database!
            // (Assuming your createTicket method just calls repository.save(), which also updates existing records)
            Ticket savedTicket = ticketService.createTicket(ticket);

            return new ResponseEntity<>(savedTicket, HttpStatus.OK);

        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}