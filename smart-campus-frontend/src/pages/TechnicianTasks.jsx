import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../ticketService'; // Adjust path if needed
import { useAuth } from '../hooks/useAuth';
import '../styles/TicketPages.css';

const TechnicianTasks = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [assignedTickets, setAssignedTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            fetchMyTasks();
        }
    }, [user]);

    const fetchMyTasks = async () => {
        try {
            setLoading(true);
            const response = await ticketService.getAssignedTickets(user.id);
            setAssignedTickets(response.data);
        } catch (error) {
            console.error("Error fetching assigned tickets:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="ticket-loading-state">Loading your tasks...</div>;

    return (
        <div className="ticket-page-wrapper">
            <div className="ticket-card">
                <h2 className="ticket-page-title">My Assigned Tasks</h2>
                <p>Welcome back, {user?.name || 'Technician'}. Here is your current workload.</p>

                {assignedTickets.length === 0 ? (
                    <div className="ticket-empty-state">
                        <p>You have no tickets currently assigned to you. Great job!</p>
                    </div>
                ) : (
                    <div className="ticket-task-grid">
                        {assignedTickets.map(ticket => (
                            <div
                                key={ticket.id}
                                className="ticket-task-card"
                                style={{ backgroundColor: ticket.status === 'RESOLVED' ? '#f0fdf4' : '#ffffff' }}
                            >
                                <div>
                                    <h3 className="ticket-task-heading">Ticket #{ticket.id} - {ticket.category}</h3>
                                    <p style={{ margin: 0, color: '#5a6783' }}>{ticket.description.substring(0, 80)}...</p>
                                    <div className="ticket-task-meta">
                                        <span className={`ticket-status-pill ticket-status-${String(ticket.status).toLowerCase().replace(/\s+/g, '-')}`}>
                                            {ticket.status}
                                        </span>
                                        <span>Priority: {ticket.priority}</span>
                                    </div>
                                </div>
                                <div className="ticket-task-actions">
                                    <button
                                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                                        className="ticket-button ticket-button-secondary"
                                    >
                                        View / Update
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TechnicianTasks;