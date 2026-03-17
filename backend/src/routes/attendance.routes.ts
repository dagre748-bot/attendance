import { Router } from 'express';
import { generateQR, markAttendance, manualAttendance, getStudentAttendance, getClassAttendance, exportExcel } from '../controllers/attendance.controller';
import { authenticateToken, authorizeRole } from '../middlewares/auth.middleware';

const router = Router();

// Student routes
router.get('/generate-qr', authenticateToken, authorizeRole(['STUDENT']), generateQR);
router.get('/student-history', authenticateToken, authorizeRole(['STUDENT']), getStudentAttendance);

// Teacher routes
router.post('/mark', authenticateToken, authorizeRole(['TEACHER']), markAttendance);
router.post('/manual', authenticateToken, authorizeRole(['TEACHER']), manualAttendance);
router.get('/class-history', authenticateToken, authorizeRole(['TEACHER']), getClassAttendance);
router.get('/export', authenticateToken, authorizeRole(['TEACHER']), exportExcel);

export default router;
