'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Booking {
  id: string;
  hours: number;
  totalAmount: number;
  status: string;
  startDate: string | null;
  workSubmittedAt: string | null;
  service: {
    id: string;
    title: string;
    hourlyRate: number;
  };
  freelancer: {
    id: string;
    name: string;
    email: string;
  };
}

export default function ClientDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'services' | 'bookings'>('services');
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
    if (user) {
      fetchData();
    }
  }, [user, loading]);

  const fetchData = async () => {
    try {
      const [servicesRes, bookingsRes] = await Promise.all([
        api.get('/services'),
        api.get('/bookings/my-bookings')
      ]);
      setServices(servicesRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoadingData(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
      ESCROW_HELD: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-purple-100 text-purple-800',
      SUBMITTED: 'bg-orange-100 text-orange-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      DISPUTED: 'bg-pink-100 text-pink-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading || loadingData) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-gray-800 cursor-pointer">Service Box</h1>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user?.name}</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Client</span>
            <button onClick={logout} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Tabs */}
      <div className="container mx-auto p-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('services')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === 'services'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Browse Services
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === 'bookings'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            My Bookings
          </button>
        </div>

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Available Services</h2>
            {services.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No services available yet.</p>
            ) : (
              <div className="grid gap-4">
                {services.map((service: any) => (
                  <div key={service.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{service.title}</h3>
                        <p className="text-gray-600 text-sm">{service.description}</p>
                        <div className="flex gap-3 mt-2">
                          <span className="text-blue-600 font-bold">${service.hourlyRate}/hour</span>
                          <span className="text-sm text-gray-500">by {service.freelancer?.name}</span>
                        </div>
                      </div>
                      <Link href={`/services/${service.id}`}>
                        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                          Book Now
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">My Bookings</h2>
            {bookings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No bookings yet.</p>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{booking.service.title}</h3>
                        <p className="text-gray-600 text-sm">Freelancer: {booking.freelancer.name}</p>
                        <div className="flex gap-3 mt-2">
                          <span className="text-gray-700">{booking.hours} hours</span>
                          <span className="text-blue-600 font-bold">${booking.totalAmount}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadge(booking.status)}`}>
                          {booking.status.replace('_', ' ')}
                        </span>
                        <Link href={`/bookings/${booking.id}`}>
                          <button className="ml-3 text-blue-600 hover:text-blue-800">View Details →</button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}