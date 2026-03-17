import { Router } from 'express';
import { createSchedule, getSchedules } from '../controllers/schedule.controller';
import { authenticateToken, authorizeRole } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticateToken, authorizeRole(['TEACHER']), createSchedule);
router.get('/', authenticateToken, getSchedules);

export default router;
