import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User } from '../types';
import { sampleUsers } from '../data/sampleData';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
}

type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'LOAD_USER'; payload: User | null };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true };
    case 'LOGIN_SUCCESS':
      return { user: action.payload, isAuthenticated: true, loading: false };
    case 'LOGIN_FAILURE':
      return { user: null, isAuthenticated: false, loading: false };
    case 'LOGOUT':
      return { user: null, isAuthenticated: false, loading: false };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    case 'LOAD_USER':
      return { 
        user: action.payload, 
        isAuthenticated: action.payload !== null, 
        loading: false 
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    loading: true
  });

  useEffect(() => {
    // Load user from localStorage on app start
    const savedUser = localStorage.getItem('uspAdmin_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: 'LOAD_USER', payload: user });
      } catch (error) {
        dispatch({ type: 'LOAD_USER', payload: null });
      }
    } else {
      dispatch({ type: 'LOAD_USER', payload: null });
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For demo purposes, accept any password for existing users
    const user = sampleUsers.find(u => u.username === username && u.active);
    
    if (user) {
      const updatedUser = { ...user, lastLogin: new Date().toISOString() };
      localStorage.setItem('uspAdmin_user', JSON.stringify(updatedUser));
      dispatch({ type: 'LOGIN_SUCCESS', payload: updatedUser });
      return true;
    } else {
      dispatch({ type: 'LOGIN_FAILURE' });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('uspAdmin_user');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (user: User) => {
    localStorage.setItem('uspAdmin_user', JSON.stringify(user));
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};