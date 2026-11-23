import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMsal } from '@azure/msal-react';
import axios from 'axios';

interface ReporteAnalitica {
  totalTicketsVendidos: number;
  recaudacionTotal: number;
  ventasPorEvento?: Record<string, number>;
  recaudacionPorEvento?: Record<string, number>;
}

interface AuditoriaItem {
  accion: string;
  eventoId: number;
  usuarioAdmin: string;
  detalle: string;
  fecha: string;
}

export const AnaliticaPanel = () => {
  const { user } = useAuth();
  const { instance, accounts } = useMsal();

  const [reporte, setReporte] = useState<ReporteAnalitica | null>(null);
  const [auditoria, setAuditoria] = useState<AuditoriaItem[]>([]);
  const [filtroAccion, setFiltroAccion] = useState('');
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL;
  const apiScope = `api://${import.meta.env.VITE_CLIENT_ID}/access_as_user`;

  const obtenerToken = async () => {
    const response = await instance.acquireTokenSilent({
      scopes: [apiScope],
      account: accounts[0],
    });
    return response.accessToken;
  };

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await obtenerToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [resReportes, resAuditoria] = await Promise.all([
        axios.get<ReporteAnalitica>(`${apiUrl}/api/bff/admin/analitica/reportes`, { headers }),
        axios.get<AuditoriaItem[]>(`${apiUrl}/api/bff/admin/analitica/auditoria`, {
          headers,
          params: {
            ...(filtroAccion ? { accion: filtroAccion } : {}),
            ...(filtroUsuario.trim() ? { usuario: filtroUsuario.trim() } : {}),
          },
        }),
      ]);

      setReporte(resReportes.data);
      setAuditoria(resAuditoria.data);
    } catch (err) {
      console.error('Error cargando analítica:', err);
      setError('No se pudieron cargar los reportes o la auditoría. Verifica tus permisos de administrador.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accounts.length > 0) {
      cargarDatos();
    }
  }, [instance, accounts]);

  const badgeAccion = (accion: string) => {
    if (accion.includes('CREADO')) return 'bg-green-100 text-green-800';
    if (accion.includes('ACTUALIZADO')) return 'bg-blue-100 text-blue-800';
    if (accion.includes('ELIMINADO')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-white border border-gray-200 border-t-4 border-orange-500 rounded-sm p-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1 tracking-tight">
            Analítica y Auditoría (Kafka)
          </h2>
          <p className="text-sm text-gray-500">
            Operador actual: {user?.name || 'Administrador'}
          </p>
        </div>
        <button
          onClick={cargarDatos}
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-sm transition-colors text-sm disabled:opacity-50"
        >
          {loading ? 'Actualizando...' : 'Actualizar Datos'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-sm border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Tarjetas de Reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-sm p-6">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Total Tickets Vendidos
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {reporte?.totalTicketsVendidos ?? 0}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-sm p-6">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Recaudación Total
          </p>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            ${(reporte?.recaudacionTotal ?? 0).toLocaleString('es-CL')}
          </p>
        </div>
      </div>

      {/* Filtros de Auditoría */}
      <div className="bg-white border border-gray-200 rounded-sm p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Acción</label>
          <select
            value={filtroAccion}
            onChange={(e) => setFiltroAccion(e.target.value)}
            className="border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
          >
            <option value="">Todas</option>
            <option value="EVENTO_CREADO">EVENTO_CREADO</option>
            <option value="EVENTO_ACTUALIZADO">EVENTO_ACTUALIZADO</option>
            <option value="EVENTO_ELIMINADO">EVENTO_ELIMINADO</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-700 mb-1">Usuario Admin</label>
          <input
            type="text"
            value={filtroUsuario}
            onChange={(e) => setFiltroUsuario(e.target.value)}
            placeholder="ej. admin@ticketplus.cl"
            className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
          />
        </div>

        <button
          onClick={cargarDatos}
          disabled={loading}
          className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-sm text-sm transition-colors"
        >
          Filtrar
        </button>
      </div>

      {/* Tabla de Auditoría */}
      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evento ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario Admin</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {auditoria.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-6 text-center text-sm text-gray-500">
                  No hay registros de auditoría para mostrar.
                </td>
              </tr>
            ) : (
              auditoria.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold">
                    <span className={`px-2 py-1 rounded-sm ${badgeAccion(item.accion)}`}>
                      {item.accion}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{item.eventoId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.usuarioAdmin}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.detalle}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.fecha).toLocaleString('es-CL')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};