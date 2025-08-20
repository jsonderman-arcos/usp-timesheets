import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User } from '../types';
import { userService } from '../services/supabaseService';
import { supabase } from '../lib/supabase';
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
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const user = await userService.getCurrentUser();
          dispatch({ type: 'LOAD_USER', payload: user });
        } else {
          dispatch({ type: 'LOAD_USER', payload: null });
        }
      } catch (error) {
        console.error('Error checking session:', error);
        dispatch({ type: 'LOAD_USER', payload: null });
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const user = await userService.getCurrentUser();
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'LOGOUT' });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });
    
    // Check if this is a demo user first
    const demoUser = sampleUsers.find(user => 
      user.username === username || user.email === username
    );
    
    if (demoUser) {
      // Simulate successful login for demo users
      dispatch({ type: 'LOGIN_SUCCESS', payload: demoUser });
      return true;
    }
    
    try {
      // For demo, we'll use username as email for now
      const email = username.includes('@') ? username : `${username}@uspcontractor.com`;
      await userService.signIn(email, password);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ type: 'LOGIN_FAILURE' });
      return false;
    }
  };

  const logout = () => {
    userService.signOut();
  };

  const updateUser = (user: User) => {
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