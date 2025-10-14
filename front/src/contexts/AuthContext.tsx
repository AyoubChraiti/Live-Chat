import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'http://localhost:3000/api';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('chatApp_currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        validateSession(user);
      } catch (error) {
        console.error('Failed to restore session:', error);
        localStorage.removeItem('chatApp_currentUser');
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateSession = async (user: User) => {
    try {
      const response = await fetch(`${API_URL}/users/${user.id}`);
      if (response.ok) {
        setCurrentUser(user);
      } else {
        localStorage.removeItem('chatApp_currentUser');
      }
    } catch (error) {
      console.error('Failed to validate session:', error);
      localStorage.removeItem('chatApp_currentUser');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Invalid credentials');
    }

    const user = await response.json();
    setCurrentUser(user);
    localStorage.setItem('chatApp_currentUser', JSON.stringify(user));
  };

  const register = async (username: string, password: string) => {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('chatApp_currentUser');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, isLoading }}>
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
