import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMsal } from '@azure/msal-react';
import axios from 'axios';

interface Evento {
  id: number;
  nombre: string;
  recinto: string;
  fecha: string;
  precioDesde: number;
  destacado?: boolean;
}

interface ReporteAnalitica {
  totalTicketsVendidos: number;
  recaudacionTotal: number;
}

interface AuditoriaItem {
  accion: string;
  eventoId: number;
  usuarioAdmin: string;
  detalle: string;
  fecha: string;
}

interface TopicoKafka {
  nombre: string;
  particiones: number;
  replicas: number;
}

interface EstadoServicios {
  eventos: 'online' | 'offline';
  analitica: 'online' | 'offline';
  kafka: 'online' | 'offline';
}

export const Dashboard = () => {
  const { user } = useAuth();
  const { instance, accounts } = useMsal();

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [reporte, setReporte] = useState<ReporteAnalitica | null>(null);
  const [auditoria, setAuditoria] = useState<AuditoriaItem[]>([]);
  const [topicos, setTopicos] = useState<TopicoKafka[]>([]);
  const [servicios, setServicios] = useState<EstadoServicios>({
    eventos: 'offline',
    analitica: 'offline',
    kafka: 'offline',
  });
  const [loading, setLoading] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<string>('');

  const apiUrl = import.meta.env.VITE_API_URL;
  const apiScope = `api://${import.meta.env.VITE_CLIENT_ID}/access_as_user`;

  const obtenerToken = async () => {
    const response = await instance.acquireTokenSilent({
      scopes: [apiScope],
      account: accounts[0],
    });
    return response.accessToken;
  };

  const cargarResumenGeneral = async () => {
    setLoading(true);
    try {
      const token = await obtenerToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [resEventos, resReportes, resAuditoria, resTopicos] = await Promise.allSettled([
        axios.get<Evento[]>(`${apiUrl}/api/bff/admin/eventos`, { headers }),
        axios.get<ReporteAnalitica>(`${apiUrl}/api/bff/admin/analitica/reportes`, { headers }),
        axios.get<AuditoriaItem[]>(`${apiUrl}/api/bff/admin/analitica/auditoria`, { headers }),
        axios.get<TopicoKafka[]>(`${apiUrl}/api/bff/admin/kafka/topicos`, { headers }),
      ]);

      if (resEventos.status === 'fulfilled') setEventos(resEventos.value.data);
      if (resReportes.status === 'fulfilled') setReporte(resReportes.value.data);
      if (resAuditoria.status === 'fulfilled') setAuditoria(resAuditoria.value.data);
      if (resTopicos.status === 'fulfilled') setTopicos(resTopicos.value.data);

      setServicios({
        eventos: resEventos.status === 'fulfilled' ? 'online' : 'offline',
        analitica:
          resReportes.status === 'fulfilled' || resAuditoria.status === 'fulfilled'
            ? 'online'
            : 'offline',
        kafka: resTopicos.status === 'fulfilled' ? 'online' : 'offline',
      });

      setUltimaActualizacion(new Date().toLocaleTimeString('es-CL'));
    } catch (err) {
      console.error('Error cargando resumen del dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accounts.length > 0) {
      cargarResumenGeneral();
    }
  }, [instance, accounts]);

  const proximosEventos = [...eventos]
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(0, 5);

  const actividadReciente = [...auditoria].slice(-5).reverse();

  const badgeAccion = (accion: string) => {
    if (accion.includes('CREADO')) return 'bg-green-100 text-green-800';
    if (accion.includes('ACTUALIZADO')) return 'bg-blue-100 text-blue-800';
    if (accion.includes('ELIMINADO')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const pillServicio = (nombre: string, estado: 'online' | 'offline') => (
    <div className="flex items-center space-x-2 text-xs font-medium px-3 py-1.5 rounded-sm border border-gray-200 bg-gray-50">
      <span
        className={`h-2 w-2 rounded-full ${
          estado === 'online' ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      <span className="text-gray-700">{nombre}</span>
      <span className={estado === 'online' ? 'text-green-700' : 'text-red-600'}>
        {estado === 'online' ? 'Activo' : 'Sin conexión'}
      </span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Encabezado principal */}
      <div className="bg-white border border-gray-200 border-t-4 border-orange-500 rounded-sm p-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1 tracking-tight">
            Resumen General - TicketPlus
          </h2>
          <p className="text-sm text-gray-500">
            Operador actual: {user?.name || 'Administrador'}
            {ultimaActualizacion && ` · Actualizado a las ${ultimaActualizacion}`}
          </p>
        </div>
        <button
          onClick={cargarResumenGeneral}
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-sm transition-colors text-sm disabled:opacity-50"
        >
          {loading ? 'Actualizando...' : 'Actualizar Panel'}
        </button>
      </div>

      {/* Estado de microservicios */}
      <div className="bg-white border border-gray-200 rounded-sm p-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Estado de Microservicios (vía BFF Privado)
        </span>
        <div className="flex flex-wrap gap-2">
          {pillServicio('ms-eventos', servicios.eventos)}
          {pillServicio('ms-analitica', servicios.analitica)}
          {pillServicio('ms-admin (Kafka)', servicios.kafka)}
        </div>
      </div>

      {/* 4 Tarjetas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Eventos Activos
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{eventos.length}</p>
          <Link to="/eventos" className="text-xs text-orange-600 hover:underline mt-2 inline-block">
            Administrar catálogo →
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Tickets Vendidos
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {reporte?.totalTicketsVendidos ?? 0}
          </p>
          <Link to="/tickets" className="text-xs text-orange-600 hover:underline mt-2 inline-block">
            Ver desglose de ventas →
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Recaudación Total
          </p>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            ${(reporte?.recaudacionTotal ?? 0).toLocaleString('es-CL')}
          </p>
          <Link to="/analitica" className="text-xs text-orange-600 hover:underline mt-2 inline-block">
            Ir a analítica →
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Tópicos Kafka
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{topicos.length}</p>
          <Link to="/kafka" className="text-xs text-orange-600 hover:underline mt-2 inline-block">
            Gestionar clúster →
          </Link>
        </div>
      </div>

      {/* Grilla principal: Próximos eventos + Actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos eventos */}
        <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-900">Próximos Eventos</h3>
            <Link to="/eventos" className="text-xs font-medium text-orange-600 hover:text-orange-700">
              Ver todos
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {proximosEventos.length === 0 ? (
              <p className="p-6 text-sm text-gray-500 text-center">No hay eventos registrados.</p>
            ) : (
              proximosEventos.map((ev) => (
                <div key={ev.id} className="px-6 py-3.5 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{ev.nombre}</p>
                    <p className="text-xs text-gray-500">{ev.recinto}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-700">{ev.fecha}</p>
                    <p className="text-xs text-orange-600 font-semibold">
                      ${(ev.precioDesde ?? 0).toLocaleString('es-CL')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Actividad reciente de auditoría */}
        <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-900">Actividad Reciente (Auditoría)</h3>
            <Link to="/analitica" className="text-xs font-medium text-orange-600 hover:text-orange-700">
              Ver historial
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {actividadReciente.length === 0 ? (
              <p className="p-6 text-sm text-gray-500 text-center">
                Aún no hay eventos de auditoría en Kafka.
              </p>
            ) : (
              actividadReciente.map((item, idx) => (
                <div key={idx} className="px-6 py-3.5 flex justify-between items-start gap-3 hover:bg-gray-50">
                  <div className="space-y-1">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-sm ${badgeAccion(item.accion)}`}>
                      {item.accion}
                    </span>
                    <p className="text-sm text-gray-800">{item.detalle}</p>
                    <p className="text-xs text-gray-500">{item.usuarioAdmin}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(item.fecha).toLocaleTimeString('es-CL', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="bg-white border border-gray-200 rounded-sm p-5">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Accesos Rápidos de Operación
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/eventos"
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-sm transition-colors"
          >
            + Gestionar Eventos
          </Link>
          <Link
            to="/kafka"
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-sm transition-colors"
          >
            Administrar Tópicos Kafka
          </Link>
          <Link
            to="/rabbitmq"
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-sm transition-colors"
          >
            Administrar Colas RabbitMQ
          </Link>
          <Link
            to="/usuarios"
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-sm transition-colors"
          >
            Panel de Usuarios (Cognito)
          </Link>
        </div>
      </div>
    </div>
  );
};