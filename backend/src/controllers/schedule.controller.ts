import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../prisma';
import { io } from '../index';

export const createSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const { classId, subjectId, date, time } = req.body;
    const teacherId = req.user?.userId;

    // Verify teacher owns the class
    const cls = await prisma.class.findUnique({ where: { id: classId } });
    if (!cls || cls.teacherId !== teacherId) {
      return res.status(403).json({ message: 'Not authorized for this class' });
    }

    const schedule = await prisma.schedule.create({
      data: {
        classId,
        subjectId,
        date: new Date(date),
        time
      },
      include: {
        subject: { select: { name: true } },
        class: { select: { name: true } }
      }
    });

    // Notify all students in the class
    const students = await prisma.user.findMany({
      where: { classId, role: 'STUDENT' }
    });

    const notifications = students.map((student: any) => ({
      userId: student.id,
      message: `New schedule added for ${schedule.subject.name} on ${new Date(date).toLocaleDateString()} at ${time}.`,
      type: 'SCHEDULE'
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({ data: notifications });
      
      // Emit socket event to the class room or all students
      students.forEach((student: any) => {
        io.emit(`notification_${student.id}`, {
          message: notifications[0].message,
          type: 'SCHEDULE'
        });
      });
    }

    res.status(201).json({ message: 'Schedule created successfully', schedule });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ message: 'Error creating schedule' });
  }
};

export const getSchedules = async (req: AuthRequest, res: Response) => {
  try {
    const { classId, date } = req.query;

    let whereClause: any = {};
    if (classId) whereClause.classId = String(classId);
    if (date) {
        const queryDate = new Date(String(date));
        whereClause.date = {
            gte: queryDate,
            lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000)
        }
    }

    const schedules = await prisma.schedule.findMany({
      where: whereClause,
      include: {
        subject: true,
        class: true
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ]
    });

    res.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ message: 'Error fetching schedules' });
  }
};
