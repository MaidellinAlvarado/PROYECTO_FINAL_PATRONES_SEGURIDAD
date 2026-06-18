import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DOMPurify from 'dompurify'; 

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate(); 
  
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [orgDesc, setOrgDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchOrgs = async () => {
    try {
      const response = await api.get('/orgs');
      setOrgs(response.data);
    } catch (err) {
      setError('Error al cargar las organizaciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    const cleanName = DOMPurify.sanitize(orgName);
    const cleanDesc = DOMPurify.sanitize(orgDesc);

    try {
      await api.post('/orgs', {
        name: cleanName,
        description: cleanDesc
      });
      
      setOrgName('');
      setOrgDesc('');
      setShowModal(false);
      fetchOrgs();
    } catch (err) {
      console.error(err);
      alert('Error al crear la organización');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 border-b border-gray-700 pb-4">
          <h1 className="text-3xl font-bold text-blue-400 mb-4 sm:mb-0">
            SecureCollab Workspace
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">Hola, <span className="font-semibold text-white">{user?.email}</span></span>
            <button 
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-200"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-200">Mis Organizaciones</h2>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition"
          >
            + Nueva Organización
          </button>
        </div>
        
        {loading ? (
          <p className="text-blue-400 animate-pulse text-lg">Cargando tus organizaciones...</p>
        ) : error ? (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg">{error}</div>
        ) : orgs.length === 0 ? (
          <div className="bg-gray-800 p-8 rounded-xl text-center border border-gray-700 shadow-lg">
            <p className="text-gray-400 text-lg">Aún no perteneces a ninguna organización.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orgs.map((org) => (
              <div key={org._id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl hover:border-blue-500 transition duration-300 group flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition">{org.name}</h3>
                  <p className="text-gray-400 text-sm mb-6 line-clamp-2">
                    {org.description || 'Sin descripción'}
                  </p>
                </div>
                <button 
                  onClick={() => navigate(`/org/${org._id}`)}  // <-- Aquí está la conexión activada
                  className="w-full bg-gray-700 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition duration-200"
                >
                  Entrar a la Organización
                </button>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-600 w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-4">Crear Nueva Organización</h3>
              <form onSubmit={handleCreateOrg} className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Nombre</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Descripción</label>
                  <textarea
                    value={orgDesc}
                    onChange={(e) => setOrgDesc(e.target.value)}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                    rows="3"
                  ></textarea>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
                  >
                    {isCreating ? 'Creando...' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}