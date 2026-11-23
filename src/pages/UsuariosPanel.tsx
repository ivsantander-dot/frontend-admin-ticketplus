import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface UsuarioCognito {
  sub: string;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'CLIENTE';
  estado: 'CONFIRMED' | 'FORCE_CHANGE_PASSWORD' | 'DISABLED';
  ultimoAcceso: string;
}

export const UsuariosPanel = () => {
  const { user } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('');

  // Datos de ejemplo mientras se integra AWS Cognito
  const usuariosMock: UsuarioCognito[] = [
    {
      sub: 'cognito-sub-001',
      nombre: user?.name || 'Administrador TicketPlus',
      email: user?.username || 'admin@ticketplus.cl',
      rol: 'ADMIN',
      estado: 'CONFIRMED',
      ultimoAcceso: 'Hace unos minutos',
    },
    {
      sub: 'cognito-sub-002',
      nombre: 'Cliente Demo',
      email: 'cliente@ticketplus.cl',
      rol: 'CLIENTE',
      estado: 'CONFIRMED',
      ultimoAcceso: '2026-11-22 20:15',
    },
    {
      sub: 'cognito-sub-003',
      nombre: 'Operador Pendiente',
      email: 'operador@ticketplus.cl',
      rol: 'ADMIN',
      estado: 'FORCE_CHANGE_PASSWORD',
      ultimoAcceso: 'Sin accesos',
    },
  ];

  const usuariosFiltrados = usuariosMock.filter((u) => {
    const coincideTexto =
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase());
    const coincideRol = filtroRol ? u.rol === filtroRol : true;
    return coincideTexto && coincideRol;
  });

  const badgeEstado = (estado: UsuarioCognito['estado']) => {
    if (estado === 'CONFIRMED') return 'bg-green-100 text-green-800';
    if (estado === 'FORCE_CHANGE_PASSWORD') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 border-t-4 border-orange-500 rounded-sm p-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1 tracking-tight">
            Gestión de Usuarios
          </h2>
          <p className="text-sm text-gray-500">
            Operador actual: {user?.name || 'Administrador'}
          </p>
        </div>
        <button
          disabled
          title="Disponible al integrar AWS Cognito"
          className="bg-orange-500 text-white font-medium py-2 px-4 rounded-sm text-sm opacity-50 cursor-not-allowed"
        >
          + Invitar Usuario
        </button>
      </div>

      {/* Aviso de integración pendiente */}
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-sm text-sm flex items-center justify-between">
        <span>
          <strong>Modo Vista Previa:</strong> Esta sección está preparada para conectarse a un <strong>AWS Cognito User Pool</strong>. Los registros mostrados son de ejemplo.
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider bg-amber-100 px-2 py-1 rounded-sm">
          Cognito Pendiente
        </span>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Usuarios en Pool</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{usuariosMock.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Administradores</p>
          <p className="text-2xl font-bold text-orange-600 mt-2">
            {usuariosMock.filter((u) => u.rol === 'ADMIN').length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor de Identidad</p>
          <p className="text-lg font-semibold text-gray-700 mt-2">AWS Cognito (Por configurar)</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-gray-200 rounded-sm p-4 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[220px]">
          <label className="block text-xs font-medium text-gray-700 mb-1">Buscar usuario</label>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Nombre o correo electrónico..."
            className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Rol</label>
          <select
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
            className="border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
          >
            <option value="">Todos</option>
            <option value="ADMIN">ADMIN</option>
            <option value="CLIENTE">CLIENTE</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado Cognito</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Último Acceso</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usuariosFiltrados.map((u) => (
              <tr key={u.sub} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{u.nombre}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-700">
                  {u.rol}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold">
                  <span className={`px-2 py-1 rounded-sm ${badgeEstado(u.estado)}`}>
                    {u.estado}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.ultimoAcceso}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <button disabled className="text-gray-400 cursor-not-allowed">Editar Rol</button>
                  <button disabled className="text-gray-400 cursor-not-allowed">Deshabilitar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};