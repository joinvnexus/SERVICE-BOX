import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.ts';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ✅ PUBLIC: Get all active services (ক্লায়েন্ট দেখার জন্য)
router.get('/', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { status: 'ACTIVE' },
      include: {
        freelancer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// ✅ Get single service details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        freelancer: {
          select: {
            id: true,
            name: true,
            email: true,
            balance: true
          }
        }
      }
    });
    
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

// ✅ Get my services (Freelancer - authenticated)
router.get('/my-services', authMiddleware, async (req: any, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { status: 'ACTIVE' },
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// ✅ Create new service (Freelancer only)
router.post('/', authMiddleware, async (req: any, res) => {
  try {
    const { title, description, hourlyRate } = req.body;
    
    const service = await prisma.service.create({
      data: {
        title,
        description,
        hourlyRate,
        freelancerId: req.user.id
      }
    });
    
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// ✅ Delete service (Freelancer only)
router.delete('/:id', authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params;
    
    const service = await prisma.service.findUnique({
      where: { id }
    });
    
    if (!service || service.freelancerId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await prisma.service.delete({ where: { id } });
    res.json({ message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

export default router;