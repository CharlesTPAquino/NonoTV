import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const AuthContext = createContext(null);

const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const VITE_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const VITE_SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY;
const VITE_APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD || 'nono2026';

const APP_VERSION = '2026.04.13';

const TOKEN_KEY = 'nono_auth_token';
const EXPIRY_KEY = 'nono_auth_expiry';
const NAME_KEY = 'nono_auth_name';
const PLAN_KEY = 'nono_auth_plan';
const PASSWORD_KEY = 'nono_password';

const supabaseAnon = VITE_SUPABASE_URL && VITE_SUPABASE_ANON_KEY 
  ? createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) 
  : null;

const supabaseService = VITE_SUPABASE_URL && VITE_SUPABASE_SERVICE_KEY 
  ? createClient(VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_KEY) 
  : null;

function getDeviceId() {
  let deviceId = localStorage.getItem('nono_device_id');
  if (!deviceId) {
    deviceId = 'device_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('nono_device_id', deviceId);
  }
  return deviceId;
}

function calculateExpiry(days) {
  if (!days || days <= 0) return 0;
  return Date.now() + days * 24 * 60 * 60 * 1000;
}

function getDaysRemaining(expiry) {
  if (!expiry || expiry <= 0) return null;
  const remaining = expiry - Date.now();
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / (24 * 60 * 60 * 1000));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLocalAuth, setIsLocalAuth] = useState(false);

  const login = useCallback(async (email, password) => {
    if (!supabaseAnon) {
      if (password === VITE_APP_PASSWORD) {
        const expiry = calculateExpiry(30);
        localStorage.setItem(PASSWORD_KEY, password);
        localStorage.setItem(EXPIRY_KEY, expiry.toString());
        localStorage.setItem(NAME_KEY, 'Admin');
        localStorage.setItem(PLAN_KEY, '30');
        setUser({ name: 'Admin', plan: 30, deviceId: getDeviceId() });
        setIsLocalAuth(true);
        return { success: true };
      }
      return { success: false, error: 'Senha incorreta' };
    }

    try {
      const { data, error } = await supabaseAnon
        .from('clients')
        .select('*')
        .eq('name', email)
        .eq('password', password)
        .single();

      if (error || !data) {
        return { success: false, error: 'Credenciais inválidas' };
      }

      if (!data.active) {
        return { success: false, error: 'Conta inativa' };
      }

      if (data.expires && data.expires < Date.now()) {
        return { success: false, error: 'Plano expirado' };
      }

      const deviceId = getDeviceId();
      const sessionResponse = await fetch(`${VITE_SUPABASE_URL}/functions/v1/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_session', client_id: data.id, deviceId })
      });

      if (!sessionResponse.ok) {
        return { success: false, error: 'Falha ao criar sessão' };
      }

      const { token, error: sessionError } = await sessionResponse.json();
      if (sessionError) {
        return { success: false, error: sessionError };
      }

      const expiry = calculateExpiry(data.plan || 30);
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(EXPIRY_KEY, expiry.toString());
      localStorage.setItem(NAME_KEY, data.name);
      localStorage.setItem(PLAN_KEY, String(data.plan || 30));

      setUser({ ...data, deviceId });
      setIsLocalAuth(false);
      return { success: true };
    } catch (err) {
      console.error('[Auth] Erro no login:', err);
      return { success: false, error: err.message };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    localStorage.removeItem(NAME_KEY);
    localStorage.removeItem(PLAN_KEY);
    localStorage.removeItem(PASSWORD_KEY);
    setUser(null);
    setIsLocalAuth(false);
  }, []);

  const checkSession = useCallback(async () => {
    if (!supabaseAnon) {
      const localPassword = localStorage.getItem(PASSWORD_KEY);
      if (localPassword === VITE_APP_PASSWORD) {
        const expiry = parseInt(localStorage.getItem(EXPIRY_KEY) || '0');
        if (expiry && Date.now() < expiry) {
          const name = localStorage.getItem(NAME_KEY);
          const plan = localStorage.getItem(PLAN_KEY);
          setUser({ name, plan: parseInt(plan), deviceId: getDeviceId() });
          setIsLocalAuth(true);
          setLoading(false);
          return true;
        }
      }
      setLoading(false);
      return false;
    }

    const token = localStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem(EXPIRY_KEY);
    const name = localStorage.getItem(NAME_KEY);

    if (!token || !expiry || Date.now() >= parseInt(expiry)) {
      logout();
      setLoading(false);
      return false;
    }

    try {
      const deviceId = getDeviceId();
      const response = await fetch(`${VITE_SUPABASE_URL}/functions/v1/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'validate', deviceId })
      });

      if (response.status === 401 || !(await response.json()).valid) {
        console.warn('[Auth] Sessão invalidada');
        logout();
        window.location.reload();
        return false;
      }
      
      const plan = localStorage.getItem(PLAN_KEY);
      setUser({ name, plan: parseInt(plan), deviceId });
      setLoading(false);
      return true;
    } catch {
      setLoading(false);
      return true;
    }
  }, [logout]);

  useEffect(() => {
    checkSession();
    const interval = setInterval(() => checkSession(), 60000);
    return () => clearInterval(interval);
  }, [checkSession]);

  const validate = useCallback(async (email, password) => {
    return login(email, password);
  }, [login]);

  const addClient = useCallback(async (name, password, plan = 30) => {
    if (!supabaseService) {
      return { success: false, error: 'Supabase não configurado' };
    }
    try {
      const { data, error } = await supabaseService
        .from('clients')
        .insert({ name, password, active: true, plan, expires: calculateExpiry(plan) })
        .select()
        .single();
      if (error) throw error;
      return { success: true, client: data };
    } catch (err) {
      console.error('[Auth] Erro ao adicionar cliente:', err);
      return { success: false, error: err.message };
    }
  }, []);

  const toggleClient = useCallback(async (clientId) => {
    if (!supabaseService) {
      return { success: false, error: 'Supabase não configurado' };
    }
    try {
      const { data } = await supabaseService.from('clients').select('active').eq('id', clientId).single();
      if (!data) return { success: false, error: 'Cliente não encontrado' };
      
      const { error } = await supabaseService
        .from('clients')
        .update({ active: !data.active })
        .eq('id', clientId);
      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const deleteClient = useCallback(async (clientId) => {
    if (!supabaseService) {
      return { success: false, error: 'Supabase não configurado' };
    }
    try {
      const { error } = await supabaseService.from('clients').delete().eq('id', clientId);
      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const getClients = useCallback(async () => {
    if (!supabaseAnon) return [];
    try {
      const { data } = await supabaseAnon.from('clients').select('*').order('created_at', { ascending: false });
      return data || [];
    } catch {
      return [];
    }
  }, []);

  const isLoggedIn = useCallback(() => {
    return !!user;
  }, [user]);

  const value = {
    user,
    loading,
    isLocalAuth,
    login,
    logout,
    validate,
    addClient,
    toggleClient,
    deleteClient,
    getClients,
    isLoggedIn,
    isSupabaseConfigured: !!supabaseAnon,
    appVersion: APP_VERSION,
    checkVersion: async () => {
      if (!supabaseAnon) return { update: false };
      try {
        const { data } = await supabaseAnon.from('app_config').select('*').limit(1).single();
        if (data) return { update: data.version !== APP_VERSION, latestVersion: data.version, updateUrl: data.update_url };
      } catch {}
      return { update: false };
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;