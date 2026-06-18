import { createContext, useState, useEffect, useContext } from 'react';
import api, { setAccessToken } from '../services/api';

// Contexto de autenticación para manejar el estado del usuario y el token en toda la aplicación
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al montar el componente, intentamos refrescar el token para mantener la sesión activa
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await api.post('/auth/refresh');
        setAccessToken(data.accessToken);

      
        setUser(data.user || { role: 'user' }); 
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false); 
      }
    };
    checkSession();
  }, []);

  // Función para iniciar sesión
  const login = (userData, token) => {
    setAccessToken(token);
    setUser(userData);
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      await api.post('/auth/logout'); 
    } catch (error) {
      console.error('Error al hacer logout', error);
    } finally {
      setAccessToken(null);
      setUser(null);
      window.location.href = '/login'; 
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);