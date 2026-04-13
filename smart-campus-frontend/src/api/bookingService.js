import axiosInstance from './axiosInstance';

export async function createBooking(booking) {
  const response = await axiosInstance.post('/v1/bookings', booking);
  return response.data;
}

export async function getBookingsByUserId(userId) {
  const response = await axiosInstance.get('/v1/bookings', { params: { userId } });
  return response.data;
}

export async function cancelBooking(bookingId, userId) {
  const response = await axiosInstance.put(`/v1/bookings/${bookingId}/cancel`, { userId });
  return response.data;
}

