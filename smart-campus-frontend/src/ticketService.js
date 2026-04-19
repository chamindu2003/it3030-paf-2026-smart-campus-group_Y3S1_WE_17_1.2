import axiosInstance from './api/axiosInstance';

const API_URL = 'http://localhost:8081/api/tickets';

export const ticketService = {
    // 1. Get all tickets
    getAllTickets: () => axiosInstance.get(API_URL),

    // 2. Create a ticket (returns the new ticket with its ID)
    createTicket: (ticketData) => axiosInstance.post(API_URL, ticketData),

    // 3. Upload a file for a specific ticket
    uploadTicketFile: (ticketId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        return axiosInstance.post(`${API_URL}/${ticketId}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    // 4. Fetch a single ticket by its ID
    getTicketById: (id) => axiosInstance.get(`${API_URL}/${id}`),

    // 5. Fetch all comments for a specific ticket
    getComments: (ticketId) => axiosInstance.get(`${API_URL}/${ticketId}/comments`),

    // 6. Fetch tickets created by a specific user
    getUserTickets: (userId) => axiosInstance.get(`${API_URL}/user/${userId}`),

    // 6. Post a new comment to a specific ticket
    addComment: (ticketId, commentData) => axiosInstance.post(`${API_URL}/${ticketId}/comments`, commentData),

    // 7. Update status using the API_URL variable
    updateTicketStatus: (id, status) => {
        return axiosInstance.put(`${API_URL}/${id}/status`, { status });
    },

    // 8. Assign ticket using the API_URL variable
    assignTicket: (id, assigneeId) => {
        return axiosInstance.put(`${API_URL}/${id}/assign`, { assigneeId });
    },

    // 9. Call assigned tickets using the API_URL variable
    getAssignedTickets: (assigneeId) => {
        return axiosInstance.get(`${API_URL}/assigned/${assigneeId}`);
    }
};