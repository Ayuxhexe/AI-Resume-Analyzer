import { createContext, startTransition, useContext, useState } from 'react';
import authService from '../services/authService.js';
import { AUTH_STORAGE_KEY } from '../services/storageKeys.js';

const AuthContext = createContext(null);

const getStoredAuth = () => {
  try {
    const storedValue = localStorage.getItem(AUTH_STORAGE_KEY);
    return storedValue ? JSON.parse(storedValue) : null;
  } catch (_error) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => getStoredAuth());

  const persistAuth = (nextState) => {
    if (nextState) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextState));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }

    startTransition(() => {
      setAuthState(nextState);
    });
  };

  const handleAuthResponse = (response) => {
    if (response?.token && response?.user) {
      persistAuth({ token: response.token, user: response.user });
    }

    return response;
  };

  const login = async (payload) => {
    const response = await authService.login(payload);
    return handleAuthResponse(response);
  };

  const register = async (payload) => {
    const response = await authService.register(payload);
    return handleAuthResponse(response);
  };

  const googleSignIn = async (payload) => {
    const response = await authService.googleSignIn(payload);
    return handleAuthResponse(response);
  };

  const verifyOtp = async (payload) => {
    const response = await authService.verifyOtp(payload);
    return handleAuthResponse(response);
  };

  const resendOtp = async (payload) => {
    return authService.resendOtp(payload);
  };

  const logout = () => {
    persistAuth(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user: authState?.user || null,
        token: authState?.token || null,
        isAuthenticated: Boolean(authState?.token),
        googleSignIn,
        login,
        logout,
        resendOtp,
        register,
        verifyOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
