import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import DOMPurify from 'dompurify';

export default function ProjectTasks() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false); // Lo dejamos en false para probar UI
  
  // Estados para crear Tarea
  const [showModal, setShowModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [isSensitive, setIsSensitive] = useState(false); 
  const [isCreating, setIsCreating] = useState(false);

  const fetchTasks = async () => {
    try {
 
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    const cleanTitle = DOMPurify.sanitize(taskTitle);
    const cleanDesc = DOMPurify.sanitize(taskDesc);

    try {
      // Petición real al backend para crear la tarea
      const response = await api.post('/tasks', {
        title: cleanTitle,
        description: cleanDesc,
        projectId: projectId,
        isSensitive: isSensitive 
      });
      
      
      setTasks([...tasks, response.data]);
      
      // Limpieza
      setTaskTitle('');
      setTaskDesc('');
      setIsSensitive(false);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert('Error al crear la tarea. Verifica tu ruta en el backend.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
          <div>
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white mb-2 text-sm flex items-center gap-1">
              ← Volver al Proyecto
            </button>
            <h1 className="text-3xl font-bold text-white">Tablero de Tareas</h1>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-200">Tareas Activas</h2>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition shadow-lg"
          >
            + Nueva Tarea
          </button>
        </div>

        {/* Lista de Tareas */}
        {tasks.length === 0 ? (
          <div className="bg-gray-800 p-8 rounded-xl text-center border border-gray-700">
            <p className="text-gray-400 text-lg">No hay tareas creadas. ¡Agrega la primera!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task, index) => (
              <div 
                key={index} 
                className={`p-6 rounded-xl border ${task.isSensitive ? 'border-red-500 bg-red-950/20' : 'border-gray-700 bg-gray-800'} shadow-xl relative`}
              >
                {task.isSensitive && (
                  <span className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1 shadow-lg">
                    🔒 SENSITIVE
                  </span>
                )}
                <h3 className="text-xl font-bold text-white mb-2 pr-20">{task.title}</h3>
                <p className="text-gray-400 text-sm">{task.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Modal para Crear Tarea */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-600 w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-4">Crear Nueva Tarea</h3>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Título de la Tarea</label>
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Descripción</label>
                  <textarea
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                    rows="2"
                  ></textarea>
                </div>
                
   
                <div className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-700 rounded mt-4">
                  <input
                    type="checkbox"
                    id="sensitive-check"
                    checked={isSensitive}
                    onChange={(e) => setIsSensitive(e.target.checked)}
                    className="w-5 h-5 accent-red-500 cursor-pointer"
                  />
                  <label htmlFor="sensitive-check" className="text-sm font-semibold text-red-400 cursor-pointer select-none">
                    Marcar como Información Sensible (Requiere Auditoría)
                  </label>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-400 hover:text-white transition">
                    Cancelar
                  </button>
                  <button type="submit" disabled={isCreating} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50">
                    {isCreating ? 'Guardando...' : 'Crear Tarea'}
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