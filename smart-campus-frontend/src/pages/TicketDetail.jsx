import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ticketService } from '../ticketService'; // Adjust path if needed

const TicketDetail = () => {
    const { id } = useParams(); // Grabs the ticket ID from the URL
    const [ticket, setTicket] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTicketAndComments();
    }, [id]);

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

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const commentPayload = {
                content: newComment,
                authorId: 1 // Hardcoded for now until we map real users
            };
            await ticketService.addComment(id, commentPayload);
            setNewComment("");
            fetchTicketAndComments(); // Reload comments to show the new one
        } catch (error) {
            console.error("Error posting comment:", error);
        }
    };

    if (loading) return <div>Loading ticket details...</div>;
    if (!ticket) return <div>Ticket not found!</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Ticket #{ticket.id}: {ticket.category}</h2>
            <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
                <p><strong>Status:</strong> {ticket.status}</p>
                <p><strong>Priority:</strong> {ticket.priority}</p>
                <p><strong>Description:</strong> {ticket.description}</p>

                {ticket.attachmentUrl && (
                    <div style={{ marginTop: '15px' }}>
                        <p><strong>Attachment:</strong></p>
                        <img
                            src={`http://localhost:8081/uploads/${ticket.attachmentUrl}`}
                            alt="Ticket Attachment"
                            style={{ maxWidth: '100%', height: 'auto', border: '1px solid #ddd' }}
                        />
                    </div>
                )}
            </div>

            <h3>Comments</h3>
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
                {comments.length === 0 ? (
                    <p>No comments yet. Start the conversation!</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '10px' }}>
                            <p style={{ margin: '0 0 5px 0' }}>{comment.content}</p>
                            <small style={{ color: '#666' }}>
                                Author ID: {comment.authorId} | {new Date(comment.createdAt).toLocaleString()}
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
                    style={{ padding: '10px', width: '100%' }}
                    required
                />
                <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Post Comment
                </button>
            </form>
        </div>
    );
};

export default TicketDetail;