'use client';

import { useState } from 'react';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string; hourlyRate: number }) => void;
}

export default function AddServiceModal({ isOpen, onClose, onSubmit }: AddServiceModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      hourlyRate: parseFloat(hourlyRate)
    });
    setTitle('');
    setDescription('');
    setHourlyRate('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Add New Service</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Service Title"
            className="w-full p-2 border rounded mb-3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Description"
            className="w-full p-2 border rounded mb-3"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Hourly Rate ($)"
            className="w-full p-2 border rounded mb-4"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            required
          />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
              Add Service
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}