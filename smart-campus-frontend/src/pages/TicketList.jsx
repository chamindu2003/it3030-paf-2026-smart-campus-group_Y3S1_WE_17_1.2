import React, { useState, useEffect } from 'react';
import { ticketService } from '../ticketService'; // Adjust path if needed

const DashboardPage = () => {
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

    if (loading) return <div>Loading tickets...</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h2>Active Tickets Dashboard</h2>

            {tickets.length === 0 ? (
                <p>No tickets found. You are all caught up!</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                    <tr style={{ backgroundColor: '#f4f4f4', textAlign: 'left' }}>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Description</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Status</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Attachment</th>
                    </tr>
                    </thead>
                    <tbody>
                    {tickets.map((ticket) => (
                        <tr key={ticket.id}>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{ticket.id}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{ticket.description}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>
                                {ticket.status}
                            </td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                {ticket.attachmentUrl ? (
                                    <a href={`http://localhost:8081/uploads/${ticket.attachmentUrl}`} target="_blank" rel="noreferrer">
                                        View File
                                    </a>
                                ) : (
                                    "No File"
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default DashboardPage;