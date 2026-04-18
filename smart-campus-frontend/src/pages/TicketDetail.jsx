import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ticketService } from '../ticketService'; // Adjust path if needed
import { userAPI } from '../api/apiService'; // Assuming this exists to fetch users
import { useAuth } from '../hooks/useAuth';

const TicketDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();

    const [ticket, setTicket] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);

    // Admin & Tech state
    const [technicians, setTechnicians] = useState([]);
    const [selectedTechId, setSelectedTechId] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const activeRole = String(user?.role || '').toUpperCase();
    const isAdmin = activeRole === 'ADMIN';
    const isTechnician = activeRole === 'TECHNICIAN';

    useEffect(() => {
        fetchTicketAndComments();
    }, [id]);

    useEffect(() => {
        // Pre-fill dropdowns when ticket loads
        if (ticket) {
            setSelectedStatus(ticket.status || "OPEN");
            setSelectedTechId(ticket.assigneeId || "");
        }
    }, [ticket]);

    useEffect(() => {
        // If Admin or Tech, we should fetch technicians so we can display their names
        if (isAdmin || isTechnician) {
            fetchTechnicians();
        }
    }, [isAdmin, isTechnician]);

    const fetchTicketAndComments = async () => {
        try {
            const ticketRes = await ticketService.getTicketById(id);
            setTicket(ticketRes.data);

            const commentsRes = await ticketService.getComments(id);
            setComments(commentsRes.data);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTechnicians = async () => {
        try {
            const users = await userAPI.getAll();
            const techs = users.filter(u => String(u.role).toUpperCase() === 'TECHNICIAN');
            setTechnicians(techs);
        } catch (error) {
            console.error("Error loading technicians:", error);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const commentPayload = {
                content: newComment,
                authorId: user?.id || 1, // Uses logged-in user ID, falls back to 1
                authorName: user?.name || user?.email || "Unknown User"
            };
            await ticketService.addComment(id, commentPayload);
            setNewComment("");
            fetchTicketAndComments();
        } catch (error) {
            console.error("Error posting comment:", error);
        }
    };

    const handleUpdateStatus = async () => {
        if (!selectedStatus) return;
        setActionLoading(true);
        try {
            await ticketService.updateTicketStatus(id, selectedStatus);
            fetchTicketAndComments();
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleAssignTechnician = async () => {
        if (!selectedTechId) return;
        setActionLoading(true);
        try {
            await ticketService.assignTicket(id, selectedTechId);
            fetchTicketAndComments();
        } catch (error) {
            console.error("Error assigning technician:", error);
        } finally {
            setActionLoading(false);
        }
    };

    // Helper to find technician name
    const assignedTechnician = technicians.find(t => String(t.id) === String(ticket?.assigneeId));

    if (loading) return <div>Loading ticket details...</div>;
    if (!ticket) return <div>Ticket not found!</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Ticket #{ticket.id}: {ticket.category}</h2>

            {/* Control Panel for Admins and Technicians */}
            {(isAdmin || isTechnician) && (
                <div style={{ backgroundColor: '#eef2f5', padding: '15px', borderRadius: '5px', marginBottom: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>

                    {/* Status Update (Admins & Techs) */}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Update Status:</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                style={{ padding: '8px', flex: 1 }}
                                disabled={actionLoading}
                            >
                                <option value="OPEN">OPEN</option>
                                <option value="IN_PROGRESS">IN PROGRESS</option>
                                <option value="RESOLVED">RESOLVED</option>
                                <option value="CLOSED">CLOSED</option>
                            </select>
                            <button onClick={handleUpdateStatus} disabled={actionLoading || ticket.status === selectedStatus} style={{ padding: '8px 12px', backgroundColor: '#0056b3', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                                Update
                            </button>
                        </div>
                    </div>

                    {/* Technician Assignment (Admins Only) */}
                    {isAdmin && (
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Assign Technician:</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <select
                                    value={selectedTechId}
                                    onChange={(e) => setSelectedTechId(e.target.value)}
                                    style={{ padding: '8px', flex: 1 }}
                                    disabled={actionLoading}
                                >
                                    <option value="">-- Select Technician --</option>
                                    {technicians.map(tech => (
                                        <option key={tech.id} value={tech.id}>{tech.name || tech.email}</option>
                                    ))}
                                </select>
                                <button onClick={handleAssignTechnician} disabled={actionLoading || !selectedTechId || String(ticket.assigneeId) === String(selectedTechId)} style={{ padding: '8px 12px', backgroundColor: '#17a2b8', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                                    Assign
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '5px' }}>
                <p><strong>Status:</strong> <span style={{ padding: '4px 8px', backgroundColor: ticket.status === 'RESOLVED' ? '#d4edda' : '#fff3cd', borderRadius: '4px' }}>{ticket.status}</span></p>
                <p><strong>Priority:</strong> {ticket.priority}</p>

                {/* Updated this part to show Name instead of just ID */}
                {ticket.assigneeId && (
                    <p><strong>Assigned To:</strong> {assignedTechnician ? assignedTechnician.name : `Tech ID: ${ticket.assigneeId}`}</p>
                )}

                <p><strong>Description:</strong> {ticket.description}</p>

                {ticket.attachmentUrl && (
                    <div style={{ marginTop: '15px' }}>
                        <p><strong>Attachment:</strong></p>
                        <img
                            src={`http://localhost:8081/uploads/${ticket.attachmentUrl}`}
                            alt="Ticket Attachment"
                            style={{ maxWidth: '100%', height: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    </div>
                )}
            </div>

            <h3>Comments</h3>
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
                {comments.length === 0 ? (
                    <p style={{ color: '#666' }}>No comments yet. Start the conversation!</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '10px' }}>
                            <p style={{ margin: '0 0 5px 0' }}>{comment.content}</p>
                            <small style={{ color: '#666' }}>
                                <strong>{comment.authorName || `User ID: ${comment.authorId}`}</strong> | {new Date(comment.createdAt).toLocaleString()}
                            </small>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleCommentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows="3"
                    placeholder="Type your comment here..."
                    style={{ padding: '10px', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }}
                    required
                />
                <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
                    Post Comment
                </button>
            </form>
        </div>
    );
};

export default TicketDetail;