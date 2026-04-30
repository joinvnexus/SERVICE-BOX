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
  service: {
    id: string;
    title: string;
    hourlyRate: number;
  };
  client: {
    id: string;
    name: string;
    email: string;
  };
}

export default function FreelancerDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'services' | 'bookings'>('services');
  const [loadingData, setLoadingData] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newService, setNewService] = useState({ title: '', description: '', hourlyRate: '' });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
    if (user?.role === 'FREELANCER') {
      fetchData();
    }
  }, [user, loading]);

  const fetchData = async () => {
    try {
      const [servicesRes, bookingsRes] = await Promise.all([
        api.get('/services/my-services'),
        api.get('/bookings/freelancer-bookings')
      ]);
      setServices(servicesRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoadingData(false);
    }
  };

  const addService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/services', {
        title: newService.title,
        description: newService.description,
        hourlyRate: parseFloat(newService.hourlyRate)
      });
      setIsModalOpen(false);
      setNewService({ title: '', description: '', hourlyRate: '' });
      fetchData();
    } catch (error) {
      console.error('Failed to add service', error);
    }
  };

  const deleteService = async (id: string) => {
    if (confirm('Are you sure?')) {
      try {
        await api.delete(`/services/${id}`);
        fetchData();
      } catch (error) {
        console.error('Failed to delete service', error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
      ESCROW_HELD: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-purple-100 text-purple-800',
      SUBMITTED: 'bg-orange-100 text-orange-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading || loadingData) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (user?.role !== 'FREELANCER') {
    router.push('/dashboard');
    return null;
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
            <span className="text-gray-600">Welcome, {user.name}</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Freelancer</span>
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
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            My Services
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === 'bookings'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Booking Requests
          </button>
        </div>

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">My Services</h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                + Add Service
              </button>
            </div>

            {services.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No services yet. Add your first service!</p>
            ) : (
              <div className="grid gap-4">
                {services.map((service: any) => (
                  <div key={service.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{service.title}</h3>
                        <p className="text-gray-600 text-sm">{service.description}</p>
                        <div className="mt-2">
                          <span className="text-blue-600 font-bold">${service.hourlyRate}/hour</span>
                          <span className={`ml-3 text-sm px-2 py-1 rounded-full ${
                            service.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {service.status}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteService(service.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
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
            <h2 className="text-2xl font-bold mb-6">Booking Requests</h2>
            {bookings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No bookings yet.</p>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{booking.service.title}</h3>
                        <p className="text-gray-600 text-sm">Client: {booking.client.name}</p>
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
                          <button className="ml-3 text-green-600 hover:text-green-800">View Details →</button>
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

      {/* Add Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Add New Service</h2>
            <form onSubmit={addService}>
              <input
                type="text"
                placeholder="Service Title"
                className="w-full p-2 border rounded mb-3"
                value={newService.title}
                onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                className="w-full p-2 border rounded mb-3"
                rows={3}
                value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Hourly Rate ($)"
                className="w-full p-2 border rounded mb-4"
                value={newService.hourlyRate}
                onChange={(e) => setNewService({ ...newService, hourlyRate: e.target.value })}
                required
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600">
                  Add
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}