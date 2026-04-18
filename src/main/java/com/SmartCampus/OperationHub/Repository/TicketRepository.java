package com.SmartCampus.OperationHub.Repository;

import com.SmartCampus.OperationHub.Model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    // JpaRepository gives us built-in methods like save(), findAll(), findById(), and delete()!
}