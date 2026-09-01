import { Link, useLocation } from 'react-router-dom';

export const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/usuarios', label: 'Usuarios' },
    { path: '/eventos', label: 'Eventos' },
    { path: '/tickets', label: 'Tickets' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-6 border-t-4 border-orange-500">
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 tracking-tight">TicketPlus</h2>
        <p className="text-xs text-gray-500 mt-1">Panel de Administración</p>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-3 py-2 text-sm rounded-sm transition-colors ${
                isActive
                  ? 'bg-orange-50 text-orange-700 font-medium border-l-2 border-orange-500'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
