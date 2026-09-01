import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import type { AccountInfo } from '@azure/msal-browser';

interface AuthContextType {
  isAuthenticated: boolean;
  user: AccountInfo | null;
  hasAdminRole: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [user, setUser] = useState<AccountInfo | null>(null);
  const [hasAdminRole, setHasAdminRole] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      const account = instance.getActiveAccount();
      setUser(account || null);

      // Verificar rol admin
      const idTokenClaims = account?.idTokenClaims as { roles?: string[] } | undefined;
      const isAdmin = idTokenClaims?.roles?.includes('admin') || false;
      setHasAdminRole(isAdmin);
    } else {
      setUser(null);
      setHasAdminRole(false);
    }
    setIsLoading(false);
  }, [isAuthenticated, instance]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, hasAdminRole, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
