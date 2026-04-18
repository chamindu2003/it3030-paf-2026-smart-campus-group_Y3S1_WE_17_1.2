import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ticketService } from '../ticketService'; // Adjust path if needed
import { userAPI } from '../api/apiService'; // Assuming this exists to fetch users
import { useAuth } from '../hooks/useAuth';
import '../styles/TicketPages.css';

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

    if (loading) return <div className="ticket-loading-state">Loading ticket details...</div>;
    if (!ticket) return <div className="ticket-empty-state">Ticket not found!</div>;

    return (
        <div className="ticket-page-wrapper">
            <h2 className="ticket-page-title">Ticket #{ticket.id}: {ticket.category}</h2>

            {(isAdmin || isTechnician) && (
                <div className="ticket-card ticket-action-panel">
                    <div className="ticket-action-group">
                        <div>
                            <p className="ticket-label">Update Status</p>
                            <div className="ticket-action-group-inline">
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="ticket-select"
                                    disabled={actionLoading}
                                >
                                    <option value="OPEN">OPEN</option>
                                    <option value="IN_PROGRESS">IN PROGRESS</option>
                                    <option value="RESOLVED">RESOLVED</option>
                                    <option value="CLOSED">CLOSED</option>
                                </select>
                                <button
                                    onClick={handleUpdateStatus}
                                    disabled={actionLoading || ticket.status === selectedStatus}
                                    className="ticket-button ticket-button-primary"
                                >
                                    Update
                                </button>
                            </div>
                        </div>

                        {isAdmin && (
                            <div>
                                <p className="ticket-label">Assign Technician</p>
                                <div className="ticket-action-group-inline">
                                    <select
                                        value={selectedTechId}
                                        onChange={(e) => setSelectedTechId(e.target.value)}
                                        className="ticket-select"
                                        disabled={actionLoading}
                                    >
                                        <option value="">-- Select Technician --</option>
                                        {technicians.map(tech => (
                                            <option key={tech.id} value={tech.id}>{tech.name || tech.email}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleAssignTechnician}
                                        disabled={actionLoading || !selectedTechId || String(ticket.assigneeId) === String(selectedTechId)}
                                        className="ticket-button ticket-button-secondary"
                                    >
                                        Assign
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="ticket-card ticket-detail-card ticket-detail-summary">
                <div className="ticket-detail-meta">
                    <p><strong>Status:</strong> <span className={`ticket-status-pill ticket-status-${String(ticket.status).toLowerCase().replace(/\s+/g, '-')}`}>{ticket.status}</span></p>
                    <p><strong>Priority:</strong> {ticket.priority}</p>
                    {ticket.assigneeId && (
                        <p><strong>Assigned To:</strong> {assignedTechnician ? assignedTechnician.name : `Tech ID: ${ticket.assigneeId}`}</p>
                    )}
                    <p><strong>Description:</strong> {ticket.description}</p>
                </div>
                {ticket.attachmentUrl && (
                    <div>
                        <p className="ticket-subheading">Attachment</p>
                        <img
                            src={`http://localhost:8081/uploads/${ticket.attachmentUrl}`}
                            alt="Ticket Attachment"
                            className="ticket-attachment"
                            style={{ width: '100%', borderRadius: '14px', border: '1px solid rgba(34, 49, 90, 0.08)' }}
                        />
                    </div>
                )}
            </div>

            <div className="ticket-card ticket-comments-panel">
                <h3 className="ticket-subheading">Comments</h3>
                {comments.length === 0 ? (
                    <div className="ticket-empty-state">No comments yet. Start the conversation!</div>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="ticket-comment">
                            <strong>{comment.authorName || `User ID: ${comment.authorId}`}</strong>
                            <p>{comment.content}</p>
                            <small>{new Date(comment.createdAt).toLocaleString()}</small>
                        </div>
                    ))
                )}

                <form onSubmit={handleCommentSubmit} className="ticket-form" style={{ marginTop: '16px' }}>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows="4"
                        placeholder="Type your comment here..."
                        className="ticket-textarea"
                        required
                    />
                    <button type="submit" className="ticket-button ticket-button-success">
                        Post Comment
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TicketDetail;