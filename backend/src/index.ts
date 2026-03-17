import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import authRoutes from './routes/auth.routes';
import attendanceRoutes from './routes/attendance.routes';
import classRoutes from './routes/class.routes';
import scheduleRoutes from './routes/schedule.routes';
import notificationRoutes from './routes/notification.routes';

dotenv.config();

const app = express();
const server = createServer(app);

// Socket.io for real-time updates
export const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/class', classRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/notification', notificationRoutes);

// Serve Static Files
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

app.get(/^(?!\/api).+/, (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Socket connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
