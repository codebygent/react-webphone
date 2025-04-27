import { useAuthStore } from '../store/authStore';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
