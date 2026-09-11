import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMsal } from '@azure/msal-react';
import axios from 'axios';

interface Evento {
  id: number;
  nombre: string;
  recinto: string;
  fecha: string;
  precioDesde: number;
}

type NuevoEvento = Omit<Evento, 'id'>;

export const Dashboard = () => {
  const { user } = useAuth();
  const { instance, accounts } = useMsal();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Estados para el Modal y el Formulario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventoEditando, setEventoEditando] = useState<Evento | null>(null);
  const [formData, setFormData] = useState<NuevoEvento>({
    nombre: '',
    recinto: '',
    fecha: '',
    precioDesde: 0,
  });

  const apiUrl = 'http://localhost:8082/api/bff/admin/eventos';
  const apiScope = `api://${import.meta.env.VITE_CLIENT_ID}/access_as_user`;

  const obtenerToken = async () => {
    const response = await instance.acquireTokenSilent({
      scopes: [apiScope],
      account: accounts[0]
    });
    return response.accessToken;
  };

  const fetchEventosSeguros = async () => {
    try {
      const token = await obtenerToken();
      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEventos(response.data);
    } catch (err) {
      console.error("Error obteniendo eventos:", err);
      setError("No se pudieron cargar los eventos protegidos.");
    }
  };

  useEffect(() => {
    if (accounts.length > 0) {
      fetchEventosSeguros();
    }
  }, [instance, accounts]);

  // Manejadores del Formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'precioDesde' ? Number(value) : value
    });
  };

  const abrirModalCrear = () => {
    setEventoEditando(null);
    setFormData({ nombre: '', recinto: '', fecha: '', precioDesde: 0 });
    setIsModalOpen(true);
  };

  const abrirModalEditar = (evento: Evento) => {
    setEventoEditando(evento);
    setFormData({
      nombre: evento.nombre,
      recinto: evento.recinto,
      fecha: evento.fecha,
      precioDesde: evento.precioDesde
    });
    setIsModalOpen(true);
  };

  const cerrarModal = () => setIsModalOpen(false);

  // Operaciones de Escritura (POST, PUT, DELETE)
  const guardarEvento = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await obtenerToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (eventoEditando) {
        // Actualizar (PUT)
        await axios.put(`${apiUrl}/${eventoEditando.id}`, formData, config);
      } else {
        // Crear (POST)
        await axios.post(apiUrl, formData, config);
      }
      
      cerrarModal();
      fetchEventosSeguros(); // Refrescar la tabla
    } catch (err) {
      console.error("Error guardando evento:", err);
      setError("No se pudo guardar el evento. Verifica tus permisos de administrador.");
    }
  };

  const eliminarEvento = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este evento?')) return;
    
    try {
      const token = await obtenerToken();
      await axios.delete(`${apiUrl}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEventos(eventos.filter(e => e.id !== id));
    } catch (err) {
      console.error("Error eliminando evento:", err);
      setError("No se pudo eliminar el evento. Verifica tus permisos.");
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="bg-white border border-gray-200 border-t-4 border-orange-500 rounded-sm p-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1 tracking-tight">
            Panel de Control - Eventos
          </h2>
          <p className="text-sm text-gray-500">
            Operador actual: {user?.name || 'Administrador'}
          </p>
        </div>
        <button 
          onClick={abrirModalCrear}
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-sm transition-colors text-sm"
        >
          + Nuevo Evento
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-sm border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recinto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {eventos.map((evento) => (
              <tr key={evento.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{evento.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{evento.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{evento.recinto}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{evento.fecha}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => abrirModalEditar(evento)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => eliminarEvento(evento.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-sm shadow-xl max-w-md w-full p-6 border-t-4 border-orange-500">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {eventoEditando ? 'Editar Evento' : 'Crear Nuevo Evento'}
            </h3>
            
            <form onSubmit={guardarEvento} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Evento</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recinto</label>
                <input
                  type="text"
                  name="recinto"
                  value={formData.recinto}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio Desde ($)</label>
                <input
                  type="number"
                  name="precioDesde"
                  value={formData.precioDesde}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-sm text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-sm text-sm transition-colors"
                >
                  {eventoEditando ? 'Guardar Cambios' : 'Crear Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};