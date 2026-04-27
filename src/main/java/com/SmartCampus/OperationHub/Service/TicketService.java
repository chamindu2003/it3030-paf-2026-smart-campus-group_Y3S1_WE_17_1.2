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

    @Autowired
    private NotificationService notificationService;

    public Ticket createTicket(Ticket ticket) {
        ticket.setStatus(TicketStatus.OPEN);
        Ticket saved = ticketRepository.save(ticket);
        notificationService.notifyTicketCreated(saved);
        return saved;
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
        Ticket saved = ticketRepository.save(existingTicket);
        if (saved.getUserId() != null) {
            notificationService.notifyTicketStatusChanged(saved.getUserId(), saved.getId(), saved.getStatus().name());
        }
        return saved;
    }

    //Handles finding the ticket and updating the assigneeId
    public Ticket assignTechnician(Long id, Long assigneeId) {
        Ticket existingTicket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));

        existingTicket.setAssigneeId(assigneeId);
        Ticket saved = ticketRepository.save(existingTicket);

        if (saved.getAssigneeId() != null) {
            notificationService.notifyTicketAssigned(saved.getAssigneeId(), saved.getId());
        }

        if (saved.getUserId() != null) {
            notificationService.notifyTicketStatusChanged(
                    saved.getUserId(),
                    saved.getId(),
                    "ASSIGNED"
            );
        }

        return saved;
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