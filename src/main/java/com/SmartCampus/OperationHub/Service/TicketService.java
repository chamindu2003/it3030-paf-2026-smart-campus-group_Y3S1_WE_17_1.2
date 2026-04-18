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

    public Ticket createTicket(Ticket ticket) {
        ticket.setStatus(TicketStatus.OPEN);
        return ticketRepository.save(ticket);
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Ticket updateTicketStatus(Long id, TicketStatus newStatus) {
        Ticket existingTicket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));

        existingTicket.setStatus(newStatus);
        return ticketRepository.save(existingTicket);
    }

    // This handles the file URL updating!
    public Ticket updateTicketAttachment(Long id, String attachmentUrl) {
        Ticket existingTicket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));

        existingTicket.setAttachmentUrl(attachmentUrl);
        return ticketRepository.save(existingTicket);
    }

    public void deleteTicket(Long id) {
        ticketRepository.deleteById(id);
    }
}