import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageSpinner } from '@/components/PageSpinner';

// Code splitting: each page is its own JS file, downloaded only when that route is opened.
// (Navbar, ProtectedRoute and AuthContext are on every page, so they stay in the main bundle.)
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const Logout = lazy(() => import('@/pages/Logout'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Admin = lazy(() => import('@/pages/Admin'));
const Forbidden = lazy(() => import('@/pages/Forbidden'));

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        {/* Shown while a page's JS file is downloading (usually a few ms). */}
        <Suspense fallback={<PageSpinner />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forbidden" element={<Forbidden />} />
            <Route path="/logout" element={<Logout />} />

            {/* Authentication: any logged-in user */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            {/* Authorization: admin only */}
            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/admin" element={<Admin />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
