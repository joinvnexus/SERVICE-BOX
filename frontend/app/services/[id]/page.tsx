'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function ServiceDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [service, setService] = useState<any>(null);
  const [hours, setHours] = useState(1);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      const response = await api.get(`/services/${id}`);
      setService(response.data);
    } catch (error) {
      console.error('Failed to fetch service', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      router.push('/');
      return;
    }

    setBookingLoading(true);
    try {
      const response = await api.post('/bookings', {
        serviceId: service.id,
        freelancerId: service.freelancer.id,
        hours: hours,
        totalAmount: service.hourlyRate * hours
      });
      
      alert('Booking created! Redirecting to payment...');
      router.push(`/bookings/${response.data.id}/payment`);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">Service not found</div>
      </div>
    );
  }

  const totalAmount = service.hourlyRate * hours;

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="container mx-auto max-w-4xl">
        <button
          onClick={() => router.back()}
          className="mb-4 text-blue-600 hover:text-blue-800"
        >
          ← Back
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Service Info */}
          <div className="p-6 border-b">
            <h1 className="text-3xl font-bold mb-2">{service.title}</h1>
            <p className="text-gray-500 mb-4">by {service.freelancer.name}</p>
            <p className="text-gray-700 text-lg">{service.description}</p>
          </div>

          {/* Pricing & Booking */}
          <div className="p-6 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl font-bold text-blue-600">${service.hourlyRate}/hour</span>
              <span className="text-gray-500">Minimum 1 hour</span>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Hours
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={hours}
                onChange={(e) => setHours(parseInt(e.target.value))}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between text-lg">
                <span>Total Amount:</span>
                <span className="font-bold text-blue-600">${totalAmount}</span>
              </div>
            </div>

            <button
              onClick={handleBooking}
              disabled={bookingLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {bookingLoading ? 'Processing...' : 'Book This Service'}
            </button>

            {!user && (
              <p className="text-center text-sm text-gray-500 mt-3">
                Please <button onClick={() => router.push('/')} className="text-blue-600">login</button> to book
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}