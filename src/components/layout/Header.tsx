import { useAuth } from '../../contexts/AuthContext';
import { SignOutButton } from '../auth/SignOutButton';

export const Header = () => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 border-t-4 border-orange-500 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Panel de Administración</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {user?.name || 'Usuario'}
            </p>
            <p className="text-xs text-gray-500">
              {user?.username || ''}
            </p>
          </div>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
};
