import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/student/Dashboard';
import QRGenerator from './pages/student/QRGenerator';
import TeacherDashboard from './pages/teacher/Dashboard';
import QRScanner from './pages/teacher/QRScanner';
import Layout from './components/Layout';

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles: string[] }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!roles.includes(user.role)) {
    return <Navigate to="/" replace />; // Redirect to base
  }

  return <>{children}</>;
};

const DefaultRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
  if (user?.role === 'TEACHER') return <Navigate to="/teacher/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={<DefaultRedirect />} />

      {/* Student Routes */}
      <Route path="/student" element={
        <ProtectedRoute roles={['STUDENT']}>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="qr" element={<QRGenerator />} />
      </Route>

      {/* Teacher Routes */}
      <Route path="/teacher" element={
        <ProtectedRoute roles={['TEACHER']}>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<TeacherDashboard />} />
        <Route path="scan" element={<QRScanner />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
