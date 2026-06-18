import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // <-- Agregamos Link aquí
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DOMPurify from 'dompurify'; 

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // sanitización de entradas para prevenir XSS
    const cleanEmail = DOMPurify.sanitize(email);
    const cleanPassword = DOMPurify.sanitize(password);

    try {
      const response = await api.post('/auth/login', {
        email: cleanEmail,
        password: cleanPassword
      });

      login(response.data.user, response.data.accessToken);
      navigate('/dashboard');
      
    } catch (err) {
      if (err.response?.status === 429) {
        const retryAfter = err.response.headers['retry-after'] || 15;
        setError(`Demasiados intentos (Brute Force detectado). Espera ${retryAfter} segundos.`);
      } else if (err.response?.status === 401 || err.response?.status === 404) {
        setError('Correo o contraseña incorrectos.');
      } else {
        setError('Error de conexión con el servidor.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md">
        <h2 className="text-3xl font-bold text-blue-400 mb-6 text-center">
          SecureCollab
        </h2>
        
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 disabled:opacity-50"
          >
            {isLoading ? 'Conectando...' : 'Iniciar Sesión'}
          </button>
        </form>

  
        <p className="text-center text-gray-400 mt-6 text-sm">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="text-blue-400 hover:underline">
            Regístrate aquí
          </Link>
        </p>

      </div>
    </div>
  );
}