import { Router } from 'express';
import { createClass, getClasses, createSubject, getSubjects, getStudents } from '../controllers/class.controller';
import { authenticateToken, authorizeRole } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticateToken, authorizeRole(['TEACHER']), createClass);
router.get('/', authenticateToken, authorizeRole(['TEACHER']), getClasses);

router.post('/subject', authenticateToken, authorizeRole(['TEACHER']), createSubject);
router.get('/subject', authenticateToken, getSubjects);

router.get('/students', authenticateToken, authorizeRole(['TEACHER']), getStudents);

export default router;
