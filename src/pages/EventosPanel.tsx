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
  imagenUrl?: string;
  destacado?: boolean;
}

type NuevoEvento = Omit<Evento, 'id'>;

export const EventosPanel = () => {
  const { user } = useAuth();
  const { instance, accounts } = useMsal();

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [soloDestacados, setSoloDestacados] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventoEditando, setEventoEditando] = useState<Evento | null>(null);
  const [formData, setFormData] = useState<NuevoEvento>({
    nombre: '',
    recinto: '',
    fecha: '',
    precioDesde: 0,
    imagenUrl: '',
    destacado: false,
  });

  const apiUrl = import.meta.env.VITE_API_URL;
  const apiScope = `api://${import.meta.env.VITE_CLIENT_ID}/access_as_user`;

  const obtenerToken = async () => {
    const response = await instance.acquireTokenSilent({
      scopes: [apiScope],
      account: accounts[0],
    });
    return response.accessToken;
  };

  const cargarEventos = async () => {
    try {
      const token = await obtenerToken();
      const response = await axios.get<Evento[]>(`${apiUrl}/api/bff/admin/eventos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEventos(response.data);
      setError(null);
    } catch (err) {
      console.error('Error cargando eventos:', err);
      setError('No se pudieron cargar los eventos.');
    }
  };

  useEffect(() => {
    if (accounts.length > 0) {
      cargarEventos();
    }
  }, [instance, accounts]);

  const abrirModalCrear = () => {
    setEventoEditando(null);
    setFormData({ nombre: '', recinto: '', fecha: '', precioDesde: 0, imagenUrl: '', destacado: false });
    setIsModalOpen(true);
  };

  const abrirModalEditar = (evento: Evento) => {
    setEventoEditando(evento);
    setFormData({
      nombre: evento.nombre,
      recinto: evento.recinto,
      fecha: evento.fecha,
      precioDesde: evento.precioDesde,
      imagenUrl: evento.imagenUrl || '',
      destacado: Boolean(evento.destacado),
    });
    setIsModalOpen(true);
  };

  const guardarEvento = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await obtenerToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (eventoEditando) {
        await axios.put(`${apiUrl}/api/bff/admin/eventos/${eventoEditando.id}`, formData, config);
      } else {
        await axios.post(`${apiUrl}/api/bff/admin/eventos/crear`, formData, config);
      }
      setIsModalOpen(false);
      cargarEventos();
    } catch (err) {
      console.error('Error guardando evento:', err);
      setError('No se pudo guardar el evento.');
    }
  };

  const eliminarEvento = async (id: number) => {
    if (!window.confirm('¿Deseas eliminar este evento?')) return;
    try {
      const token = await obtenerToken();
      await axios.delete(`${apiUrl}/api/bff/admin/eventos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEventos(eventos.filter((e) => e.id !== id));
    } catch (err) {
      console.error('Error eliminando evento:', err);
      setError('No se pudo eliminar el evento.');
    }
  };

  const eventosFiltrados = eventos.filter((ev) => {
    const matchTexto =
      ev.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      ev.recinto.toLowerCase().includes(busqueda.toLowerCase());
    const matchDestacado = soloDestacados ? Boolean(ev.destacado) : true;
    return matchTexto && matchDestacado;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 border-t-4 border-orange-500 rounded-sm p-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1 tracking-tight">
            Catálogo de Eventos
          </h2>
          <p className="text-sm text-gray-500">
            Operador actual: {user?.name || 'Administrador'} · Total registrados: {eventos.length}
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
        <div className="bg-red-50 text-red-700 p-4 rounded-sm border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Buscador y filtro */}
      <div className="bg-white border border-gray-200 rounded-sm p-4 flex flex-wrap gap-4 items-center justify-between">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o recinto..."
          className="flex-1 min-w-[220px] border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
        />
        <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={soloDestacados}
            onChange={(e) => setSoloDestacados(e.target.checked)}
            className="rounded-sm accent-orange-500"
          />
          <span>Solo destacados</span>
        </label>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recinto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Desde</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destacado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {eventosFiltrados.map((evento) => (
              <tr key={evento.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{evento.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{evento.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{evento.recinto}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{evento.fecha}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${(evento.precioDesde ?? 0).toLocaleString('es-CL')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold">
                  {evento.destacado ? (
                    <span className="px-2 py-1 rounded-sm bg-orange-100 text-orange-800">Destacado</span>
                  ) : (
                    <span className="text-gray-400">Normal</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => abrirModalEditar(evento)} className="text-blue-600 hover:text-blue-900 mr-4">
                    Editar
                  </button>
                  <button onClick={() => eliminarEvento(evento.id)} className="text-red-600 hover:text-red-900">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-sm shadow-xl max-w-md w-full p-6 border-t-4 border-orange-500">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {eventoEditando ? 'Editar Evento' : 'Crear Nuevo Evento'}
            </h3>
            <form onSubmit={guardarEvento} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recinto</label>
                <input
                  type="text"
                  value={formData.recinto}
                  onChange={(e) => setFormData({ ...formData, recinto: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio Desde ($)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.precioDesde}
                    onChange={(e) => setFormData({ ...formData, precioDesde: Number(e.target.value) })}
                    required
                    className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de Imagen (opcional)</label>
                <input
                  type="text"
                  value={formData.imagenUrl}
                  onChange={(e) => setFormData({ ...formData, imagenUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
              <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(formData.destacado)}
                  onChange={(e) => setFormData({ ...formData, destacado: e.target.checked })}
                  className="accent-orange-500"
                />
                <span>Marcar como evento destacado</span>
              </label>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-sm text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-sm text-sm"
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