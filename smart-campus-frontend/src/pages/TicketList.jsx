import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ticketService } from '../ticketService';
import { useAuth } from '../hooks/useAuth';
import TicketNavBar from '../components/TicketNavBar';
import '../styles/TicketPages.css';

const TicketList = () => {
    const { user, loading: authLoading } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('Active Tickets');

    const resolvedUserId = user?.id ?? user?.userId ?? user?.user?.id ?? null;
    const role = String(user?.role || 'USER').toUpperCase();
    const isWaitingForProfile = authLoading || (role !== 'ADMIN' && !resolvedUserId);

    useEffect(() => {
        if (!user) return;
        if (isWaitingForProfile) return;
        fetchTickets();
    }, [user, resolvedUserId, role, isWaitingForProfile]);

    const fetchTickets = async () => {
        try {
            let response;
            if (role === 'ADMIN') {
                response = await ticketService.getAllTickets();
                setTitle('All Tickets');
            } else if (role === 'TECHNICIAN') {
                response = await ticketService.getAssignedTickets(resolvedUserId);
                setTitle('Assigned Tickets');
            } else {
                response = await ticketService.getUserTickets(resolvedUserId);
                setTitle('My Tickets');
            }

            setTickets(response.data);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="ticket-loading-state">Loading ticket access...</div>;
    if (authLoading || isWaitingForProfile) return <div className="ticket-loading-state">Loading tickets...</div>;
    if (loading) return <div className="ticket-loading-state">Loading tickets...</div>;

    return (
        <div className="ticket-page-wrapper">
            <TicketNavBar currentPage="list" />
            <div className="ticket-card ticket-list-card">
                <h2 className="ticket-page-title">{title}</h2>
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
                                        <span className={`ticket-status-pill ticket-status-${String(ticket.status).toLowerCase().replaceAll(' ', '-')}`}>{ticket.status}</span>
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