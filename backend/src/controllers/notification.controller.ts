import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../prisma';
import { io } from '../index';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const notification = await prisma.notification.updateMany({
      where: { id: String(id), userId },
      data: { readStatus: true }
    });

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error updating notification' });
  }
};

export const createAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const { message, classId } = req.body;
    const teacherId = req.user?.userId;

    // Verify teacher owns the class
    const cls = await prisma.class.findUnique({ where: { id: classId } });
    if (!cls || cls.teacherId !== teacherId) {
      return res.status(403).json({ message: 'Not authorized for this class' });
    }

    const students = await prisma.user.findMany({
      where: { classId, role: 'STUDENT' }
    });

    const notifications = students.map((student: any) => ({
      userId: student.id,
      message,
      type: 'ANNOUNCEMENT'
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({ data: notifications });

      students.forEach((student: any) => {
        io.emit(`notification_${student.id}`, { message, type: 'ANNOUNCEMENT' });
      });
    }

    res.status(201).json({ message: 'Announcement sent successfully' });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ message: 'Error sending announcement' });
  }
};
