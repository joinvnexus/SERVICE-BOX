'use client';

import Link from 'next/link';

interface Service {
  id: string;
  title: string;
  description: string;
  hourlyRate: number;
  status: string;
  freelancer?: {
    id: string;
    name: string;
    email: string;
  };
}

interface ServiceCardProps {
  service: Service;
  showBookButton?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function ServiceCard({ service, showBookButton = false, onEdit, onDelete }: ServiceCardProps) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{service.title}</h3>
          
          {service.freelancer && (
            <p className="text-sm text-gray-500 mt-1">
              👤 {service.freelancer.name}
            </p>
          )}
          
          <p className="text-gray-600 text-sm mt-2">{service.description}</p>
          
          <div className="flex gap-3 mt-3">
            <span className="text-blue-600 font-bold text-lg">${service.hourlyRate}/hour</span>
            {service.status && (
              <span className={`text-sm px-2 py-1 rounded-full ${
                service.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {service.status}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          {showBookButton && (
            <Link href={`/services/${service.id}`}>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
                Book Now
              </button>
            </Link>
          )}
          
          {onEdit && (
            <button onClick={() => onEdit(service.id)} className="text-blue-500 hover:text-blue-700">
              Edit
            </button>
          )}
          
          {onDelete && (
            <button onClick={() => onDelete(service.id)} className="text-red-500 hover:text-red-700">
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}