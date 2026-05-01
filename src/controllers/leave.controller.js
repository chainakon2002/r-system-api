import prisma from '../config/prisma.js';

export const createLeaveRequest = async (req, res) => {
  try {
    const { employeeId, type, startDate, endDate, reason } = req.body;
    
    if (!employeeId || !type || !startDate || !endDate || !reason) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: 'PENDING',
      }
    });

    return res.status(201).json({ message: 'ส่งคำขอลางานสำเร็จ', leaveRequest });
  } catch (error) {
    console.error('Create Leave Request Error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการส่งคำขอลา' });
  }
};

export const getLeaveRequests = async (req, res) => {
  try {
    const { employeeId } = req.query;
    
    const whereClause = employeeId ? { employeeId } : {};
    
    const leaveRequests = await prisma.leaveRequest.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            prefix: true,
            department: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(leaveRequests);
  } catch (error) {
    console.error('Get Leave Requests Error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลการลา' });
  }
};

export const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'สถานะไม่ถูกต้อง' });
    }

    const updatedRequest = await prisma.leaveRequest.update({
      where: { id },
      data: { status }
    });

    return res.json({ message: 'อัปเดตสถานะสำเร็จ', leaveRequest: updatedRequest });
  } catch (error) {
    console.error('Update Leave Status Error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตสถานะการลา' });
  }
};
