import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/api/client';

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Silent session validation on application boot
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // ✅ FIXED: Correct path with /api
        const response = await apiClient.post('/api/auth/refresh');
        const { token, user: userData } = response.data;

        if (token) {
          localStorage.setItem('token', token);
          setUser(userData);
        }
      } catch (err) {
        // Normal case when user has no valid session
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (token: string, userData: User) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = async () => {
    try {
      // ✅ FIXED: Correct path with /api
      await apiClient.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout warning:', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be wrapped inside a valid AuthProvider.');
  }
  return context;
};