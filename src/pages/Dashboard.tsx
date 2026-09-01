import { useAuth } from '../contexts/AuthContext';

export const Dashboard = () => {
  const { user } = useAuth();

  const microservices = [
    {
      name: 'Gestión de Usuarios',
      description: 'Administración de usuarios y roles del sistema',
      status: 'Próximamente',
    },
    {
      name: 'Gestión de Eventos',
      description: 'Administración de eventos y actividades',
      status: 'Próximamente',
    },
    {
      name: 'Gestión de Tickets',
      description: 'Gestión de tickets y ventas',
      status: 'Próximamente',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 border-t-4 border-orange-500 rounded-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-1 tracking-tight">
          Bienvenido, {user?.name || 'Administrador'}
        </h2>
        <p className="text-sm text-gray-500">
          Panel de administración de TicketPlus
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {microservices.map((service) => (
          <div
            key={service.name}
            className="bg-white border border-gray-200 border-t-4 border-orange-500 rounded-sm p-5 hover:border-orange-400 transition-colors"
          >
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              {service.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              {service.description}
            </p>
            <div className="inline-block px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded-sm">
              {service.status}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-sm p-4">
        <h3 className="text-sm font-semibold text-orange-900 mb-2">
          Información Importante
        </h3>
        <p className="text-sm text-orange-800 leading-relaxed">
          Las funcionalidades de gestión de microservicios estarán disponibles en futuras actualizaciones.
          Actualmente, este panel solo permite la autenticación y navegación básica.
        </p>
      </div>
    </div>
  );
};
