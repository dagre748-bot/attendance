import { Router } from 'express';
import { getNotifications, markAsRead, createAnnouncement } from '../controllers/notification.controller';
import { authenticateToken, authorizeRole } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateToken, getNotifications);
router.patch('/:id/read', authenticateToken, markAsRead);
router.post('/announce', authenticateToken, authorizeRole(['TEACHER']), createAnnouncement);

export default router;
