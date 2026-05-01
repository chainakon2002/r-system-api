import { Router } from 'express';
import { createEmployee, getEmployees } from '../controllers/employee.controller.js';

const router = Router();

router.get('/', getEmployees);
router.post('/', createEmployee);

export default router;
