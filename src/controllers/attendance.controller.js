import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Get today's attendance for a specific employee
export const getTodayAttendance = async (req, res) => {
  try {
    const { employeeId } = req.query;
    if (!employeeId) return res.status(400).json({ error: 'Employee ID is required' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });

    return res.json(attendance);
  } catch (error) {
    console.error('Error fetching today attendance:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Check-in
export const checkIn = async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) return res.status(400).json({ error: 'Employee ID is required' });

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existing = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Already checked in today' });
    }

    // Determine status: Assuming work starts at 09:00:00
    // We can add a simple logic: if now is after 9:15 AM, it's 'สาย', else 'มาตรงเวลา'
    const startOfWork = new Date();
    startOfWork.setHours(9, 15, 0, 0);
    const status = now > startOfWork ? 'สาย' : 'มาตรงเวลา';

    const attendance = await prisma.attendance.create({
      data: {
        employeeId,
        checkIn: now,
        date: today,
        status
      }
    });

    return res.status(201).json(attendance);
  } catch (error) {
    console.error('Check-in error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Check-out
export const checkOut = async (req, res) => {
  try {
    const { id } = req.params;
    
    const attendance = await prisma.attendance.update({
      where: { id },
      data: {
        checkOut: new Date()
      }
    });

    return res.json(attendance);
  } catch (error) {
    console.error('Check-out error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get monthly stats
export const getMonthlyStats = async (req, res) => {
  try {
    const { employeeId } = req.query;
    if (!employeeId) return res.status(400).json({ error: 'Employee ID is required' });

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const attendances = await prisma.attendance.findMany({
      where: {
        employeeId,
        date: {
          gte: firstDayOfMonth
        }
      }
    });

    const present = attendances.length;
    const late = attendances.filter(a => a.status === 'สาย').length;

    return res.json({ present, late });
  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get attendance history
export const getAttendanceHistory = async (req, res) => {
  try {
    const { employeeId } = req.query;
    if (!employeeId) return res.status(400).json({ error: 'Employee ID is required' });

    const attendances = await prisma.attendance.findMany({
      where: { employeeId },
      orderBy: { date: 'desc' },
      take: 30 // last 30 records
    });

    return res.json(attendances);
  } catch (error) {
    console.error('Error fetching attendance history:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
