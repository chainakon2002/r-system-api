import express from 'express';
import { getTodayAttendance, checkIn, checkOut, getMonthlyStats, getAttendanceHistory } from '../controllers/attendance.controller.js';

const router = express.Router();

router.get('/today', getTodayAttendance);
router.post('/check-in', checkIn);
router.put('/check-out/:id', checkOut);
router.get('/stats', getMonthlyStats);
router.get('/history', getAttendanceHistory);

export default router;
