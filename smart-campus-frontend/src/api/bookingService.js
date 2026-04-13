import axiosInstance from './axiosInstance';

export async function createBooking(booking) {
  const response = await axiosInstance.post('/v1/bookings', booking);
  return response.data;
}

