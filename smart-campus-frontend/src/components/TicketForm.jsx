import React, { useState } from 'react';
import { ticketService } from '../ticketService'; // Adjust path if needed
import { useAuth } from '../hooks/useAuth';
import '../styles/TicketPages.css';

const TicketForm = () => {
    const { user } = useAuth();
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('MAINTENANCE');
    const [priority, setPriority] = useState('MEDIUM');
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resolvedUserId = user?.id ?? user?.userId ?? user?.user?.id ?? null;

    if (!resolvedUserId) {
        return (
            <div className="ticket-page-wrapper">
                <div className="ticket-card ticket-empty-state">
                    <h2 className="ticket-page-title">Login Required</h2>
                    <p>Please sign in before raising a ticket.</p>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // 1. Create the Ticket payload using the real dynamic values
            if (!resolvedUserId) {
                throw new Error('Unable to determine current user. Please log in and try again.');
            }

            const newTicket = {
                description,
                category,
                priority,
                userId: Number(resolvedUserId),
                resourceId: 1 // Dummy resource ID
            };

            // 2. Save the Ticket to the database
            const response = await ticketService.createTicket(newTicket);
            const savedTicketId = response.data.id;

            // 3. Upload the file if one was selected
            if (file) {
                await ticketService.uploadTicketFile(savedTicketId, file);
            }

            alert("Ticket submitted successfully!");

            // Reset the form
            setDescription('');
            setCategory('MAINTENANCE');
            setPriority('MEDIUM');
            setFile(null);

        } catch (error) {
            console.error("Error submitting ticket:", error);
            alert("Failed to submit ticket. Check console for details.");
        } finally {
            setIsSubmitting(false);
        }
    };

// ... existing code ...

    return (
        <div className="ticket-page-wrapper">
            <div className="ticket-card">
                <h2 className="ticket-page-title">Submit a New Ticket</h2>
                <form onSubmit={handleSubmit} className="ticket-form">

                    <div className="ticket-form-row">
                        <label className="ticket-label">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="ticket-select"
                        >
                            <option value="MAINTENANCE">Maintenance</option>
                            <option value="IT">IT Support</option>
                            <option value="CLEANING">Cleaning Services</option>
                            <option value="SECURITY">Security Incident</option>
                        </select>
                    </div>

                    <div className="ticket-form-row">
                        <label className="ticket-label">Priority</label>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="ticket-select"
                        >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="CRITICAL">Critical</option>
                        </select>
                    </div>

                    <div className="ticket-form-row">
                        <label className="ticket-label">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            rows="5"
                            placeholder="Describe the issue in detail..."
                            className="ticket-textarea"
                        />
                    </div>

                    <div className="ticket-form-row">
                        <label className="ticket-label">Attach Image</label>
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                            accept="image/*"
                            className="ticket-file-input"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="ticket-button ticket-button-primary"
                    >
                        {isSubmitting ? "Submitting..." : "Submit Ticket"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TicketForm;