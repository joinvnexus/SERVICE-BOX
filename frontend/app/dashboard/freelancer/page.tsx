'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ServiceCard from '@/components/ServiceCard';
import AddServiceModal from '@/components/AddServiceModal';
import api from '@/lib/api';

export default function FreelancerDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [services, setServices] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingServices, setLoadingServices] = useState(true);

  // ✅ FIX: all logic inside useEffect (no hoisting issue)
  useEffect(() => {
    if (loading) return;

    // ❌ not logged in
    if (!user) {
      router.push('/');
      return;
    }

    // ❌ wrong role
    if (user.role !== 'FREELANCER') {
      router.push('/dashboard');
      return;
    }

    // ✅ fetch services
    const fetchServices = async () => {
      try {
        const response = await api.get('/services/my-services');
        setServices(response.data);
      } catch (error) {
        console.error('Failed to fetch services', error);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, [user, loading, router]);

  // ✅ Add Service
  const addService = async (data: {
    title: string;
    description: string;
    hourlyRate: number;
  }) => {
    try {
      const response = await api.post('/services', data);
      setServices((prev) => [response.data, ...prev]);
    } catch (error) {
      console.error('Failed to add service', error);
    }
  };

  // ✅ Delete Service
  const deleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      await api.delete(`/services/${id}`);
      setServices((prev) => prev.filter((s: any) => s.id !== id));
    } catch (error) {
      console.error('Failed to delete service', error);
    }
  };

  // Loading UI
  if (loading || loadingServices) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Service Box</h1>

          <div className="flex items-center gap-4">
            <span>Welcome, {user?.name}</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              Freelancer
            </span>

            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">My Services</h2>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              + Add New Service
            </button>
          </div>

          {/* Empty state */}
          {services.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No services yet. Add your first service!
            </div>
          ) : (
            <div className="grid gap-4">
              {services.map((service: any) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onEdit={() => {}}
                  onDelete={deleteService}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AddServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={addService}
      />
    </div>
  );
}