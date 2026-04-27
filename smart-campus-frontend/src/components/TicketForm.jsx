import React, { useState } from 'react';
import { ticketService } from '../ticketService';
import { useAuth } from '../hooks/useAuth';
import TicketNavBar from './TicketNavBar';
import '../styles/TicketPages.css';

function resolveUserId(user) {
    const raw = localStorage.getItem('user');
    let cachedUser = null;

    if (raw) {
        try {
            cachedUser = JSON.parse(raw);
        } catch {
            cachedUser = null;
        }
    }

    return (
        user?.id ??
        user?.userId ??
        user?.user?.id ??
        cachedUser?.id ??
        cachedUser?.userId ??
        null
    );
}

const TicketForm = () => {
    const { user } = useAuth();
    const [resourceId, setResourceId] = useState('1');
    const [category, setCategory] = useState('MAINTENANCE');
    const [priority, setPriority] = useState('MEDIUM');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const resolvedUserId = resolveUserId(user);

    if (!resolvedUserId) {
        return (
            <div className="ticket-page-wrapper">
                <TicketNavBar currentPage="report" />
                <div className="ticket-card ticket-empty-state">
                    <h2 className="ticket-page-title">Login Required</h2>
                    <p>Please sign in before raising a ticket.</p>
                </div>
            </div>
        );
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const ticketPayload = {
                userId: Number(resolvedUserId),
                resourceId: Number(resourceId),
                category,
                priority,
                description: description.trim(),
            };

            const response = await ticketService.createTicket(ticketPayload);
            const savedTicketId = response?.data?.id;

            if (file && savedTicketId) {
                await ticketService.uploadTicketFile(savedTicketId, file);
            }

            setSuccessMessage('Ticket submitted successfully.');
            setDescription('');
            setCategory('MAINTENANCE');
            setPriority('MEDIUM');
            setResourceId('1');
            setFile(null);
        } catch (error) {
            const backendMessage =
                error?.response?.data?.message ||
                (typeof error?.response?.data === 'string' ? error.response.data : null);
            setErrorMessage(backendMessage || error?.message || 'Failed to submit ticket. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="ticket-page-wrapper">
            <TicketNavBar currentPage="report" />
            <div className="ticket-card">
                <h2 className="ticket-page-title">Submit a New Ticket</h2>
                {successMessage && <p className="ticket-success-message">{successMessage}</p>}
                {errorMessage && <p className="ticket-error-message">{errorMessage}</p>}
                <form onSubmit={handleSubmit} className="ticket-form">
                    <div className="ticket-form-row">
                        <label htmlFor="ticket-resource" className="ticket-label">Facility</label>
                        <select
                            id="ticket-resource"
                            value={resourceId}
                            onChange={(e) => setResourceId(e.target.value)}
                            className="ticket-select"
                        >
                            <option value="1">Main Hall</option>
                            <option value="2">Computer Lab</option>
                            <option value="3">Library</option>
                            <option value="4">Security Gate</option>
                        </select>
                    </div>

                    <div className="ticket-form-row">
                        <label htmlFor="ticket-category" className="ticket-label">Category</label>
                        <select
                            id="ticket-category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="ticket-select"
                        >
                            <option value="MAINTENANCE">Maintenance</option>
                            <option value="IT">IT Support</option>
                            <option value="CLEANING">Cleaning</option>
                            <option value="SECURITY">Security</option>
                        </select>
                    </div>

                    <div className="ticket-form-row">
                        <label htmlFor="ticket-priority" className="ticket-label">Priority</label>
                        <select
                            id="ticket-priority"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="ticket-select"
                        >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="URGENT">Urgent</option>
                        </select>
                    </div>

                    <div className="ticket-form-row">
                        <label htmlFor="ticket-description" className="ticket-label">Description</label>
                        <textarea
                            id="ticket-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            rows="5"
                            placeholder="Describe the issue in detail..."
                            className="ticket-textarea"
                        />
                    </div>

                    <div className="ticket-form-row">
                        <label htmlFor="ticket-file" className="ticket-label">Attach Image</label>
                        <input
                            id="ticket-file"
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
                        {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TicketForm;
