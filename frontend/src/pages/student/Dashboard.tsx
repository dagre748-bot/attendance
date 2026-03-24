import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Bell } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  subject?: { name: string };
}

interface Schedule {
  id: string;
  date: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [totalClassesCount, setTotalClassesCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyRes, scheduleRes] = await Promise.all([
          api.get('/attendance/student-history'),
          user?.classId ? api.get(`/schedule?classId=${user.classId}`) : Promise.resolve({ data: [] })
        ]);
        
        setHistory(historyRes.data);
        
        // Count only schedules that have already passed (or are today)
        const now = new Date();
        const pastSchedules = scheduleRes.data.filter((s: Schedule) => new Date(s.date) <= now);
        setTotalClassesCount(pastSchedules.length || 0);
        
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      }
    };
    fetchData();
  }, [user?.classId]);

  const attendedClasses = history.filter(h => h.status === 'PRESENT').length;
  // Use actual total classes if available, otherwise fallback to attended count to avoid > 100%
  const effectiveTotalClasses = Math.max(totalClassesCount, attendedClasses);
  const attendancePercentage = effectiveTotalClasses > 0 ? (attendedClasses / effectiveTotalClasses) * 100 : 0;

  const chartData = {
    labels: ['Attended', 'Missed'],
    datasets: [{
      data: [attendedClasses, Math.max(0, effectiveTotalClasses - attendedClasses)],
      backgroundColor: ['#10b981', '#ef4444'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  return (
    <div style={{ animation: 'slideUp 0.3s ease' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Student Dashboard</h1>
          <p>Welcome back, {user?.name}</p>
        </div>
        <button className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }}>
          <Bell size={20} />
        </button>
      </header>

      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card glass-panel" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3>Overall Attendance</h3>
            <div className="value">{attendancePercentage.toFixed(1)}%</div>
          </div>
          <div style={{ width: '80px', height: '80px' }}>
            <Doughnut data={chartData} options={{ cutout: '70%', plugins: { legend: { display: false } } }} />
          </div>
        </div>

        <div className="stat-card glass-panel">
          <h3>Total Classes Attended</h3>
          <div className="value" style={{ color: 'var(--accent-secondary)' }}>{attendedClasses}</div>
        </div>

        <div className="stat-card glass-panel">
          <h3>Classes Missed</h3>
          <div className="value" style={{ color: 'var(--danger)' }}>{Math.max(0, effectiveTotalClasses - attendedClasses)}</div>
        </div>
      </div>


    </div>
  );
};

export default Dashboard;
