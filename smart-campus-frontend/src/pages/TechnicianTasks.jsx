import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../ticketService'; // Adjust path if needed
import { useAuth } from '../hooks/useAuth';

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

    if (loading) return <div style={{ padding: '20px' }}>Loading your tasks...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h2>My Assigned Tasks</h2>
            <p>Welcome back, {user?.name || 'Technician'}. Here is your current workload.</p>

            {assignedTickets.length === 0 ? (
                <div style={{ padding: '20px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '5px' }}>
                    <p>You have no tickets currently assigned to you. Great job!</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                    {assignedTickets.map(ticket => (
                        <div
                            key={ticket.id}
                            style={{
                                border: '1px solid #ccc',
                                padding: '15px',
                                borderRadius: '5px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: ticket.status === 'RESOLVED' ? '#f0fdf4' : '#fff'
                            }}
                        >
                            <div>
                                <h3 style={{ margin: '0 0 5px 0' }}>Ticket #{ticket.id} - {ticket.category}</h3>
                                <p style={{ margin: '0 0 10px 0', color: '#555' }}>{ticket.description.substring(0, 80)}...</p>
                                <span style={{
                                    padding: '4px 8px',
                                    backgroundColor: ticket.status === 'OPEN' ? '#fff3cd' :
                                        ticket.status === 'IN_PROGRESS' ? '#cce5ff' : '#d4edda',
                                    borderRadius: '4px',
                                    fontSize: '0.85rem',
                                    fontWeight: 'bold'
                                }}>
                                    {ticket.status}
                                </span>
                                <span style={{ marginLeft: '10px', fontSize: '0.85rem', color: '#666' }}>
                                    Priority: {ticket.priority}
                                </span>
                            </div>
                            <button
                                onClick={() => navigate(`/tickets/${ticket.id}`)}
                                style={{
                                    padding: '10px 15px',
                                    backgroundColor: '#0056b3',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    height: 'fit-content'
                                }}
                            >
                                View / Update
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TechnicianTasks;