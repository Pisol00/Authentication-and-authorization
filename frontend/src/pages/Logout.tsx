import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PageSpinner } from '@/components/PageSpinner';

// /logout — asks the backend to clear the httpOnly cookie, then goes to /login.
export default function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    logout().then(() => navigate('/login', { replace: true }));
  }, [logout, navigate]);

  return <PageSpinner />;
}
