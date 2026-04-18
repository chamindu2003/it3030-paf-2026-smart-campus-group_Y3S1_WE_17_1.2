package com.SmartCampus.OperationHub.Repository;

import com.SmartCampus.OperationHub.Model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    // NEW: Find tickets assigned to a specific technician
    List<Ticket> findByAssigneeId(Long assigneeId);
}