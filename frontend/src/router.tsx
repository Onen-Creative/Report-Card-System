import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy } from 'react';

// Lazy load components for code splitting
const Login = lazy(() => import('@/pages/Login'));
const SystemAdminDashboard = lazy(() => import('@/pages/SystemAdminDashboard'));
const SchoolAdminDashboard = lazy(() => import('@/pages/SchoolAdminDashboard'));
const TeacherDashboard = lazy(() => import('@/pages/TeacherDashboard'));
const StudentDetails = lazy(() => import('@/pages/StudentDetails'));
const ClassView = lazy(() => import('@/pages/ClassView'));

// Loading component
function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!user.role) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RoleBasedDashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role === 'system_admin') return <SystemAdminDashboard />;
  if (user.role === 'school_admin') return <SchoolAdminDashboard />;
  if (user.role === 'teacher') return <TeacherDashboard />;
  return <Navigate to="/login" replace />;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <RoleBasedDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/students/:id',
    element: (
      <ProtectedRoute>
        <StudentDetails />
      </ProtectedRoute>
    ),
  },
  {
    path: '/classes/:id',
    element: (
      <ProtectedRoute>
        <ClassView />
      </ProtectedRoute>
    ),
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
]);

export { Loading };