import { Router } from 'express';
import { createLeaveRequest, getLeaveRequests, updateLeaveStatus } from '../controllers/leave.controller.js';

const router = Router();

router.post('/', createLeaveRequest);
router.get('/', getLeaveRequests);
router.patch('/:id/status', updateLeaveStatus);

export default router;
