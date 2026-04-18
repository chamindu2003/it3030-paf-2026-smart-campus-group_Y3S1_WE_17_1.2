import React, { useState } from 'react';
import { ticketService } from '../ticketService'; // Adjust path if needed

const TicketForm = () => {
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('MAINTENANCE');
    const [priority, setPriority] = useState('MEDIUM');
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ... existing code ...

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // 1. Create the Ticket payload using the real dynamic values
            const newTicket = {
                description: description,
                category: category,
                priority: priority,
                userId: 1, // Dummy user ID
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
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
            <h2>Submit a New Ticket</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                {/* CATEGORY DROPDOWN */}
                <div>
                    <label>Category: </label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    >
                        <option value="MAINTENANCE">Maintenance</option>
                        <option value="IT">IT Support</option>
                        <option value="CLEANING">Cleaning Services</option>
                        <option value="SECURITY">Security Incident</option>
                    </select>
                </div>

                {/* PRIORITY DROPDOWN */}
                <div>
                    <label>Priority: </label>
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                    </select>
                </div>

                {/* DESCRIPTION TEXTAREA */}
                <div>
                    <label>Description: </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows="4"
                        placeholder="Describe the issue in detail..."
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                {/* FILE ATTACHMENT */}
                <div>
                    <label>Attach Image: </label>
                    <input
                        type="file"
                        onChange={(e) => setFile(e.target.files[0])}
                        accept="image/*"
                        style={{ width: '100%', marginTop: '5px' }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{ padding: '10px', backgroundColor: '#0056b3', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                    {isSubmitting ? "Submitting..." : "Submit Ticket"}
                </button>
            </form>
        </div>
    );
};

export default TicketForm;