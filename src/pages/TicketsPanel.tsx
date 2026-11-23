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

interface ReporteAnalitica {
  totalTicketsVendidos: number;
  recaudacionTotal: number;
  ventasPorEvento?: Record<string, number>;
  recaudacionPorEvento?: Record<string, number>;
}

export const TicketsPanel = () => {
  const { user } = useAuth();
  const { instance, accounts } = useMsal();

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [reporte, setReporte] = useState<ReporteAnalitica | null>(null);
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

  const cargarResumenTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await obtenerToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [resEventos, resReporte] = await Promise.all([
        axios.get<Evento[]>(`${apiUrl}/api/bff/admin/eventos`, { headers }),
        axios.get<ReporteAnalitica>(`${apiUrl}/api/bff/admin/analitica/reportes`, { headers }),
      ]);

      setEventos(resEventos.data);
      setReporte(resReporte.data);
    } catch (err) {
      console.error('Error cargando resumen de tickets:', err);
      setError('No se pudo cargar el estado de tickets. Verifica que ms-eventos y ms-analitica estén activos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accounts.length > 0) {
      cargarResumenTickets();
    }
  }, [instance, accounts]);

  const totalTickets = reporte?.totalTicketsVendidos ?? 0;
  const recaudacion = reporte?.recaudacionTotal ?? 0;
  const ticketPromedio = totalTickets > 0 ? Math.round(recaudacion / totalTickets) : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 border-t-4 border-orange-500 rounded-sm p-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1 tracking-tight">
            Control de Tickets y Ventas
          </h2>
          <p className="text-sm text-gray-500">
            Operador actual: {user?.name || 'Administrador'}
          </p>
        </div>
        <button
          onClick={cargarResumenTickets}
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-sm transition-colors text-sm disabled:opacity-50"
        >
          {loading ? 'Actualizando...' : 'Actualizar Ventas'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-sm border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets Emitidos</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{totalTickets}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Recaudación Acumulada</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">${recaudacion.toLocaleString('es-CL')}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Promedio Ticket</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">${ticketPromedio.toLocaleString('es-CL')}</p>
        </div>
      </div>

      {/* Desglose por evento */}
      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900">Desglose de Tickets por Evento</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Base</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets Vendidos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recaudado</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {eventos.map((ev) => {
              const vendidos = reporte?.ventasPorEvento?.[String(ev.id)] ?? 0;
              const monto = reporte?.recaudacionPorEvento?.[String(ev.id)] ?? 0;
              return (
                <tr key={ev.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{ev.id} {ev.nombre}</div>
                    <div className="text-xs text-gray-500">{ev.recinto}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ev.fecha}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    ${(ev.precioDesde ?? 0).toLocaleString('es-CL')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {vendidos}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-orange-600">
                    ${monto.toLocaleString('es-CL')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};