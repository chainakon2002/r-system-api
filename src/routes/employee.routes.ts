import { Router } from 'express';
import { createEmployee } from '../controllers/employee.controller';

const router = Router();

router.post('/', createEmployee);

export default router;
