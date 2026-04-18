import axios from 'axios';

const API_URL = 'http://localhost:8081/api/tickets';

export const ticketService = {
    // 1. Get all tickets
    getAllTickets: () => axios.get(API_URL),

    // 2. Create a ticket (returns the new ticket with its ID)
    createTicket: (ticketData) => axios.post(API_URL, ticketData),

    // 3. Upload a file for a specific ticket
    uploadTicketFile: (ticketId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        return axios.post(`${API_URL}/${ticketId}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }, // <-- I ADDED THE MISSING COMMA RIGHT HERE!

    // 4. Fetch a single ticket by its ID
    getTicketById: (id) => {
        return axios.get(`${API_URL}/${id}`);
    },

    // 5. Fetch all comments for a specific ticket
    getComments: (ticketId) => {
        return axios.get(`${API_URL}/${ticketId}/comments`);
    },

    // 6. Post a new comment to a specific ticket
    addComment: (ticketId, commentData) => {
        return axios.post(`${API_URL}/${ticketId}/comments`, commentData);
    }

};