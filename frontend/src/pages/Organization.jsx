import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import DOMPurify from 'dompurify';

export default function Organization() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [org, setOrg] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para el modal del Proyecto
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchData = async () => {
    try {
      // Pedimos los datos de la org y sus proyectos en paralelo
      const [orgRes, projRes] = await Promise.all([
        api.get(`/orgs/${id}`),
        api.get(`/orgs/${id}/projects`)
      ]);
      setOrg(orgRes.data);
      setProjects(projRes.data);
    } catch (err) {
      setError('Error al cargar la organización o sus proyectos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    const cleanName = DOMPurify.sanitize(projectName);
    const cleanDesc = DOMPurify.sanitize(projectDesc);

    try {
      await api.post(`/orgs/${id}/projects`, {
        name: cleanName,
        description: cleanDesc,
        visibility: 'internal' 
      });
      
      setProjectName('');
      setProjectDesc('');
      setShowModal(false);
      fetchData(); 
    } catch (err) {
      alert('Error al crear el proyecto');
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-blue-400 p-8 flex justify-center items-center">Cargando organización...</div>;
  if (error) return <div className="min-h-screen bg-gray-900 text-red-400 p-8">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
          <div>
            <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white mb-2 text-sm flex items-center gap-1">
              ← Volver al Dashboard
            </button>
            <h1 className="text-3xl font-bold text-white">{org?.name}</h1>
            <p className="text-gray-400">{org?.description}</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-200">Proyectos</h2>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition"
          >
            + Nuevo Proyecto
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="bg-gray-800 p-8 rounded-xl text-center border border-gray-700">
            <p className="text-gray-400">No hay proyectos en esta organización.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <div key={proj._id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-2">{proj.name}</h3>
                <p className="text-gray-400 text-sm mb-6">Visibilidad: {proj.visibility}</p>
                <button 
                  onClick={() => navigate(`/project/${proj._id}`)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition"
                >
                  Ver Tareas
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Crear Proyecto */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-600 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">Crear Proyecto</h3>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Nombre</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Descripción</label>
                  <textarea
                    value={projectDesc}
                    onChange={(e) => setProjectDesc(e.target.value)}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
                    rows="2"
                  ></textarea>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">Cancelar</button>
                  <button type="submit" disabled={isCreating} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
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