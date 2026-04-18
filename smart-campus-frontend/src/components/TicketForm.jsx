import React, { useState } from 'react';
import { ticketService } from '../ticketService';

const TicketForm = () => {
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Step 1: Create the ticket first to get an ID
            const ticketData = {
                description: description,
                category: "MAINTENANCE", // Hardcoded for now to save time
                priority: "MEDIUM",
                userId: 1, // Dummy user ID for anonymous ticket
                resourceId: 1 // Dummy resource ID
            };

            const response = await ticketService.createTicket(ticketData);
            const newTicketId = response.data.id;

            // Step 2: If a file was selected, upload it using that ID
            if (file) {
                await ticketService.uploadTicketFile(newTicketId, file);
            }

            alert("Ticket created successfully with attachment!");
            setDescription('');
            setFile(null);
        } catch (error) {
            console.error("Battle failed:", error);
            alert("Error creating ticket. Check console.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', marginTop: '20px' }}>
            <h3>Report an Incident</h3>
            <form onSubmit={handleSubmit}>
                <textarea
                    placeholder="Describe the issue..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    style={{ width: '100%', height: '100px', display: 'block', marginBottom: '10px' }}
                />

                <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    style={{ marginBottom: '10px', display: 'block' }}
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Uploading..." : "Submit Ticket"}
                </button>
            </form>
        </div>
    );
};

export default TicketForm;