import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.ts';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Create booking
router.post('/', authMiddleware, async (req: any, res) => {
  try {
    const { serviceId, freelancerId, hours, totalAmount } = req.body;
    const clientId = req.user.id;

    if (clientId === freelancerId) {
      return res.status(400).json({ error: 'Cannot book your own service' });
    }

    const booking = await prisma.booking.create({
      data: {
        clientId,
        freelancerId,
        serviceId,
        hours,
        totalAmount,
        status: 'PENDING_PAYMENT'
      }
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// ✅ Get single booking by ID (with all details)
router.get('/:id', authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        service: true,
        client: {
          select: { id: true, name: true, email: true }
        },
        freelancer: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user is authorized (client or freelancer)
    if (booking.clientId !== userId && booking.freelancerId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// ✅ Update booking status (for various actions)
router.patch('/:id/status', authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const booking = await prisma.booking.findUnique({
      where: { id }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Status transition validation
    const validTransitions: Record<string, string[]> = {
      PENDING_PAYMENT: ['CANCELLED'],
      ESCROW_HELD: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['SUBMITTED', 'CANCELLED'],
      SUBMITTED: ['COMPLETED', 'DISPUTED'],
      COMPLETED: [],
      CANCELLED: [],
      DISPUTED: []
    };

    if (!validTransitions[booking.status]?.includes(status)) {
      return res.status(400).json({ error: `Cannot change from ${booking.status} to ${status}` });
    }

    // Authorization checks
    if (status === 'IN_PROGRESS' && booking.freelancerId !== userId) {
      return res.status(403).json({ error: 'Only freelancer can start work' });
    }
    
    if (status === 'SUBMITTED' && booking.freelancerId !== userId) {
      return res.status(403).json({ error: 'Only freelancer can submit work' });
    }
    
    if (status === 'COMPLETED' && booking.clientId !== userId) {
      return res.status(403).json({ error: 'Only client can complete booking' });
    }

    const updateData: any = { status };
    
    if (status === 'IN_PROGRESS') {
      updateData.startDate = new Date();
    }
    
    if (status === 'SUBMITTED') {
      updateData.workSubmittedAt = new Date();
    }
    
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData
    });

    res.json(updatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Get my bookings (Client)
router.get('/my-bookings', authMiddleware, async (req: any, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { clientId: req.user.id },
      include: {
        service: true,
        freelancer: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get bookings for freelancer
router.get('/freelancer-bookings', authMiddleware, async (req: any, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { freelancerId: req.user.id },
      include: {
        service: true,
        client: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

export default router;