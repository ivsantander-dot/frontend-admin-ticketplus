import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMsal } from '@azure/msal-react';
import axios from 'axios';

export const RabbitMQPanel = () => {
  const { user } = useAuth();
  const { instance, accounts } = useMsal();
  
  const [nombreCola, setNombreCola] = useState('');
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'exito' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;
  const apiScope = `api://${import.meta.env.VITE_CLIENT_ID}/access_as_user`;

  const obtenerToken = async () => {
    const response = await instance.acquireTokenSilent({
      scopes: [apiScope],
      account: accounts[0]
    });
    return response.accessToken;
  };

  const manejarCola = async (accion: 'crear' | 'eliminar', e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreCola.trim()) return;

    setLoading(true);
    setMensaje(null);

    try {
      const token = await obtenerToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (accion === 'crear') {
        await axios.post(`${apiUrl}/api/bff/admin/queues`, { nombre: nombreCola }, config);
        setMensaje({ texto: `Cola '${nombreCola}' creada exitosamente en RabbitMQ.`, tipo: 'exito' });
      } else {
        await axios.delete(`${apiUrl}/api/bff/admin/queues/${nombreCola}`, config);
        setMensaje({ texto: `Cola '${nombreCola}' eliminada de RabbitMQ.`, tipo: 'exito' });
      }
      
      setNombreCola('');
    } catch (err) {
      console.error(`Error al ${accion} cola:`, err);
      setMensaje({ texto: `Error al intentar ${accion} la cola. Verifica tus permisos o si la cola existe.`, tipo: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="bg-white border border-gray-200 border-t-4 border-orange-500 rounded-sm p-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1 tracking-tight">
            Infraestructura - RabbitMQ
          </h2>
          <p className="text-sm text-gray-500">
            Operador actual: {user?.name || 'Administrador'}
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm p-6 max-w-2xl">
        <p className="text-sm text-gray-600 mb-6">
          Utiliza este panel para crear o eliminar colas en el broker de mensajería (RabbitMQ). 
          Esta acción impacta directamente en la instancia de AWS.
        </p>

        {mensaje && (
          <div className={`p-4 rounded-sm mb-6 border ${mensaje.tipo === 'exito' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {mensaje.texto}
          </div>
        )}

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Cola</label>
            <input
              type="text"
              value={nombreCola}
              onChange={(e) => setNombreCola(e.target.value)}
              placeholder="ej. pagos.reembolsos.queue"
              className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
              disabled={loading}
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              onClick={(e) => manejarCola('crear', e)}
              disabled={loading || !nombreCola.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-sm text-sm transition-colors disabled:opacity-50"
            >
              Crear Cola
            </button>
            <button
              onClick={(e) => manejarCola('eliminar', e)}
              disabled={loading || !nombreCola.trim()}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-sm text-sm transition-colors disabled:opacity-50"
            >
              Eliminar Cola
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};