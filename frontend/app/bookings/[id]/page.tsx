'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

interface Booking {
  id: string;
  hours: number;
  totalAmount: number;
  status: string;
  startDate: string | null;
  workSubmittedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  service: {
    id: string;
    title: string;
    description: string;
    hourlyRate: number;
  };
  client: {
    id: string;
    name: string;
    email: string;
  };
  freelancer: {
    id: string;
    name: string;
    email: string;
  };
}

export default function BookingDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const response = await api.get(`/bookings/${id}`);
      setBooking(response.data);
    } catch (error) {
      console.error('Failed to fetch booking', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    setActionLoading(true);
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      fetchBooking(); // Refresh data
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; label: string }> = {
      PENDING_PAYMENT: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending Payment' },
      ESCROW_HELD: { color: 'bg-blue-100 text-blue-800', label: 'Escrow Held' },
      IN_PROGRESS: { color: 'bg-purple-100 text-purple-800', label: 'In Progress' },
      SUBMITTED: { color: 'bg-orange-100 text-orange-800', label: 'Work Submitted' },
      COMPLETED: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      CANCELLED: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
      DISPUTED: { color: 'bg-pink-100 text-pink-800', label: 'Disputed' }
    };
    return config[status] || { color: 'bg-gray-100 text-gray-800', label: status };
  };

  const isClient = user?.id === booking?.client?.id;
  const isFreelancer = user?.id === booking?.freelancer?.id;

  // Determine what actions to show
  const getActions = () => {
    if (!booking) return [];

    const status = booking.status;
    const actions = [];

    if (isFreelancer) {
      if (status === 'ESCROW_HELD') {
        actions.push({ label: 'Start Work', action: () => updateStatus('IN_PROGRESS'), color: 'bg-green-500' });
      }
      if (status === 'IN_PROGRESS') {
        actions.push({ label: 'Submit Work', action: () => updateStatus('SUBMITTED'), color: 'bg-blue-500' });
      }
    }

    if (isClient) {
      if (status === 'SUBMITTED') {
        actions.push({ label: 'Approve & Complete', action: () => updateStatus('COMPLETED'), color: 'bg-green-500' });
        actions.push({ label: 'Raise Dispute', action: () => updateStatus('DISPUTED'), color: 'bg-red-500' });
      }
    }

    if (status === 'PENDING_PAYMENT' && isClient) {
      actions.push({ label: 'Proceed to Payment', action: () => alert('Payment integration coming soon!'), color: 'bg-blue-500' });
      actions.push({ label: 'Cancel Booking', action: () => updateStatus('CANCELLED'), color: 'bg-red-500' });
    }

    return actions;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!booking) return null;

  const statusBadge = getStatusBadge(booking.status);
  const actions = getActions();

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="container mx-auto max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          ← Back
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold mb-2">Booking Details</h1>
                <p className="text-gray-500 text-sm">Booking ID: {booking.id.slice(0, 8)}...</p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadge.color}`}>
                  {statusBadge.label}
                </span>
              </div>
            </div>
          </div>

          {/* Service Info */}
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold mb-3">Service Information</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <Link href={`/services/${booking.service.id}`}>
                <h3 className="text-xl font-semibold text-blue-600 hover:underline">
                  {booking.service.title}
                </h3>
              </Link>
              <p className="text-gray-600 mt-2">{booking.service.description}</p>
              <div className="mt-3 flex gap-3">
                <span className="text-blue-600 font-bold">${booking.service.hourlyRate}/hour</span>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold mb-3">Booking Summary</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">Hours</p>
                <p className="text-lg font-semibold">{booking.hours} hours</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-xl font-bold text-blue-600">${booking.totalAmount}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">Created At</p>
                <p className="text-sm">{new Date(booking.createdAt).toLocaleDateString()}</p>
              </div>
              {booking.startDate && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Started At</p>
                  <p className="text-sm">{new Date(booking.startDate).toLocaleDateString()}</p>
                </div>
              )}
              {booking.workSubmittedAt && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Work Submitted</p>
                  <p className="text-sm">{new Date(booking.workSubmittedAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Parties Info */}
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold mb-3">Parties</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">Client</p>
                <p className="font-medium">{booking.client.name}</p>
                <p className="text-sm text-gray-500">{booking.client.email}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">Freelancer</p>
                <p className="font-medium">{booking.freelancer.name}</p>
                <p className="text-sm text-gray-500">{booking.freelancer.email}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {actions.length > 0 && (
            <div className="p-6 bg-gray-50">
              <h2 className="text-lg font-semibold mb-3">Actions</h2>
              <div className="flex gap-3 flex-wrap">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    disabled={actionLoading}
                    className={`${action.color} text-white px-6 py-2 rounded-lg hover:opacity-80 transition disabled:opacity-50`}
                  >
                    {actionLoading ? 'Processing...' : action.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}