import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ticketService } from '../ticketService';
import '../styles/TicketPages.css';

const TicketList = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const response = await ticketService.getAllTickets();
            setTickets(response.data);
        } catch (error) {
            console.error("Error fetching tickets:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="ticket-loading-state">Loading tickets...</div>;

    return (
        <div className="ticket-page-wrapper">
            <div className="ticket-card ticket-list-card">
                <h2 className="ticket-page-title">Active Tickets</h2>
                {tickets.length === 0 ? (
                    <div className="ticket-empty-state">No tickets found. You are all caught up!</div>
                ) : (
                    <table className="ticket-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map((ticket) => (
                                <tr key={ticket.id}>
                                    <td>{ticket.id}</td>
                                    <td>{ticket.description}</td>
                                    <td>
                                        <span className={`ticket-status-pill ticket-status-${String(ticket.status).toLowerCase().replace(/\s+/g, '-')}`}>{ticket.status}</span>
                                    </td>
                                    <td>
                                        <Link to={`/tickets/${ticket.id}`} className="ticket-button ticket-button-secondary">
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default TicketList;