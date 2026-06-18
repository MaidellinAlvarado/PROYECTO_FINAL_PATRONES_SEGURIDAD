import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {

    // Obtenemos el usuario y el estado de carga del contexto de autenticación
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-blue-400 text-xl font-semibold animate-pulse">
          Verificando credenciales...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }


  return <Outlet />;
}