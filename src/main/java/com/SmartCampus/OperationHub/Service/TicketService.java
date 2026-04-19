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

    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));
    }

    public List<Ticket> getTicketsByUser(Long userId) {
        return ticketRepository.findByUserId(userId);
    }

    public List<Ticket> getTicketsByAssignee(Long assigneeId) {
        return ticketRepository.findByAssigneeId(assigneeId);
    }

    public Ticket updateTicketStatus(Long id, TicketStatus newStatus) {
        Ticket existingTicket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));

        existingTicket.setStatus(newStatus);
        return ticketRepository.save(existingTicket);
    }

    //Handles finding the ticket and updating the assigneeId
    public Ticket assignTechnician(Long id, Long assigneeId) {
        Ticket existingTicket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));

        existingTicket.setAssigneeId(assigneeId);
        return ticketRepository.save(existingTicket);
    }

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