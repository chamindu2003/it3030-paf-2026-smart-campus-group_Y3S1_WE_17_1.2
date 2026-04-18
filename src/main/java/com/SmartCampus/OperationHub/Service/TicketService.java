package com.SmartCampus.OperationHub.Service;

import com.SmartCampus.OperationHub.Model.Ticket;
import com.SmartCampus.OperationHub.Model.TicketStatus;
import com.SmartCampus.OperationHub.Repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    // Method to create a new ticket
    public Ticket createTicket(Ticket ticket) {
        // Enforce the rule: All new tickets must start as OPEN
        ticket.setStatus(TicketStatus.OPEN);

        // Save the ticket to the database
        return ticketRepository.save(ticket);
    }

    // Method to fetch all tickets
    public List<Ticket> getAllTickets() {
        // findAll() is another magic method provided by JpaRepository
        return ticketRepository.findAll();
    }

    // Method to update a ticket's status
    public Ticket updateTicketStatus(Long id, TicketStatus newStatus) {
        // Find the existing ticket or throw an error if it doesn't exist
        Ticket existingTicket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));

        // Update the status and save
        existingTicket.setStatus(newStatus);
        return ticketRepository.save(existingTicket);
    }

    // Method to delete a ticket
    public void deleteTicket(Long id) {
        // deleteById() is another built-in magic method from JpaRepository!
        ticketRepository.deleteById(id);
    }
}