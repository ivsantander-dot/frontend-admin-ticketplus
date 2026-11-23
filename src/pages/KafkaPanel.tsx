import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMsal } from '@azure/msal-react';
import axios from 'axios';

interface TopicoKafka {
  nombre: string;
  particiones: number;
  replicas: number;
}

export const KafkaPanel = () => {
  const { user } = useAuth();
  const { instance, accounts } = useMsal();

  const [topicos, setTopicos] = useState<TopicoKafka[]>([]);
  const [nombre, setNombre] = useState('');
  const [particiones, setParticiones] = useState(3);
  const [replicas, setReplicas] = useState(2);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'exito' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;
  const apiScope = `api://${import.meta.env.VITE_CLIENT_ID}/access_as_user`;

  const obtenerToken = async () => {
    const response = await instance.acquireTokenSilent({
      scopes: [apiScope],
      account: accounts[0],
    });
    return response.accessToken;
  };

  const cargarTopicos = async () => {
    try {
      const token = await obtenerToken();
      const response = await axios.get<TopicoKafka[]>(`${apiUrl}/api/bff/admin/kafka/topicos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTopicos(response.data);
    } catch (err) {
      console.error('Error listando tópicos:', err);
      setMensaje({ texto: 'No se pudieron cargar los tópicos de Kafka.', tipo: 'error' });
    }
  };

  useEffect(() => {
    if (accounts.length > 0) {
      cargarTopicos();
    }
  }, [instance, accounts]);

  const crearTopico = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    setLoading(true);
    setMensaje(null);
    try {
      const token = await obtenerToken();
      await axios.post(
        `${apiUrl}/api/bff/admin/kafka/topicos`,
        { nombre: nombre.trim(), particiones, replicas },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMensaje({ texto: `Tópico '${nombre}' creado exitosamente.`, tipo: 'exito' });
      setNombre('');
      cargarTopicos();
    } catch (err) {
      console.error('Error creando tópico:', err);
      setMensaje({ texto: 'Error al crear el tópico. Verifica el nombre y el factor de réplica.', tipo: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const eliminarTopico = async (nombreTopico: string) => {
    if (!window.confirm(`¿Eliminar el tópico '${nombreTopico}' de Kafka?`)) return;

    setLoading(true);
    setMensaje(null);
    try {
      const token = await obtenerToken();
      await axios.delete(`${apiUrl}/api/bff/admin/kafka/topicos/${nombreTopico}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMensaje({ texto: `Tópico '${nombreTopico}' eliminado.`, tipo: 'exito' });
      cargarTopicos();
    } catch (err) {
      console.error('Error eliminando tópico:', err);
      setMensaje({ texto: `No se pudo eliminar el tópico '${nombreTopico}'.`, tipo: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 border-t-4 border-orange-500 rounded-sm p-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1 tracking-tight">
            Infraestructura - Apache Kafka
          </h2>
          <p className="text-sm text-gray-500">
            Operador actual: {user?.name || 'Administrador'}
          </p>
        </div>
        <button
          onClick={cargarTopicos}
          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-sm text-sm transition-colors"
        >
          Refrescar
        </button>
      </div>

      {mensaje && (
        <div
          className={`p-4 rounded-sm border text-sm ${
            mensaje.tipo === 'exito'
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {mensaje.texto}
        </div>
      )}

      {/* Formulario Crear Tópico */}
      <div className="bg-white border border-gray-200 rounded-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Crear Nuevo Tópico</h3>
        <form onSubmit={crearTopico} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Tópico</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="ej. ticketplus.notificaciones.eventos"
              required
              disabled={loading}
              className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Particiones</label>
            <input
              type="number"
              min={1}
              value={particiones}
              onChange={(e) => setParticiones(Number(e.target.value))}
              required
              disabled={loading}
              className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Réplicas (máx 3)</label>
            <input
              type="number"
              min={1}
              max={3}
              value={replicas}
              onChange={(e) => setReplicas(Number(e.target.value))}
              required
              disabled={loading}
              className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="md:col-span-4">
            <button
              type="submit"
              disabled={loading || !nombre.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-sm text-sm transition-colors disabled:opacity-50"
            >
              Crear Tópico
            </button>
          </div>
        </form>
      </div>

      {/* Tabla de Tópicos */}
      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Particiones</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Réplicas</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {topicos.map((topico) => (
              <tr key={topico.nombre} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{topico.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{topico.particiones}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{topico.replicas}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => eliminarTopico(topico.nombre)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};