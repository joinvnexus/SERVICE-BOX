import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Create booking
router.post('/', authMiddleware, async (req: any, res) => {
  try {
    const { serviceId, freelancerId, hours, totalAmount } = req.body;
    const clientId = req.user.id;

    // Check if freelancer is booking themselves
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
      orderBy: { completedAt: 'desc' }
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