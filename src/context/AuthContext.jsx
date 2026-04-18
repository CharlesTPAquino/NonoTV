import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const AuthContext = createContext(null);

const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const VITE_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const VITE_SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY;
const VITE_APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD || 'nono2026';
const VITE_AUTH_SERVICE_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'https://nonotv-auth.nonotv-auth.workers.dev';

const APP_VERSION = '2026.04.13';

console.log('[Auth] Supabase URL:', VITE_SUPABASE_URL ? 'Configurado' : 'Não configurado');
console.log('[Auth] Supabase Anon Key:', VITE_SUPABASE_ANON_KEY ? 'Configurado' : 'Não configurado');
console.log('[Auth] App Password:', VITE_APP_PASSWORD);
console.log('[Auth] Auth Worker URL:', VITE_AUTH_SERVICE_URL);

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
    console.log('[Auth] Login iniciado:', email);
    console.log('[Auth] supabaseAnon configurado:', !!supabaseAnon);
    console.log('[Auth] URL:', VITE_SUPABASE_URL);

    // Primeiro tenta Supabase
    if (supabaseAnon) {
      try {
        console.log('[Auth] Tentando login Supabase para:', email);
        
        const { data: clientData, error: clientError } = await supabaseAnon
          .from('clients')
          .select('*')
          .eq('name', email)
          .eq('password', password)
          .single();

        console.log('[Auth] Resposta Supabase:', { clientData, error: clientError });

        if (clientError && clientError.code !== 'PGRST116') {
          console.error('[Auth] Erro Supabase:', clientError);
        }

        // Se encontrou usuário no banco, processa normalmente
        if (!clientError && clientData) {
          const deviceId = getDeviceId();
          const currentSessionId = `device_${deviceId}`;
          
          // Verificar sessão em outro dispositivo
          if (clientData.session_id && clientData.session_id !== currentSessionId) {
            const lastActive = clientData.last_active || 0;
            const SESSION_TIMEOUT = 30 * 60 * 1000;
            
            if (Date.now() - lastActive < SESSION_TIMEOUT) {
              return { success: false, error: 'Usuário conectado em outro dispositivo', details: 'Desconecte o dispositivo atual para usar aqui' };
            }
          }
          
          // Verificar block
          if (clientData.banned_until && clientData.banned_until > Date.now()) {
            const remainingTime = Math.ceil((clientData.banned_until - Date.now()) / 60000);
            return { success: false, error: 'Conta bloqueada', details: `Tente novamente em ${remainingTime} minuto(s)` };
          }
          
          if (!clientData.active) {
            return { success: false, error: 'Conta inativa' };
          }
          
          if (clientData.expires && clientData.expires < Date.now()) {
            return { success: false, error: 'Plano expirado' };
          }
          
          // Login bem-sucedido via Supabase
          await supabaseAnon
            .from('clients')
            .update({ 
              session_id: currentSessionId,
              last_active: Date.now(),
              login_attempts: 0,
              banned_until: 0
            })
            .eq('id', clientData.id);
          
          const expiry = calculateExpiry(clientData.plan || 30);
          const token = `session_${Date.now()}_${clientData.id}`;
          localStorage.setItem(TOKEN_KEY, token);
          localStorage.setItem(EXPIRY_KEY, expiry.toString());
          localStorage.setItem(NAME_KEY, clientData.name);
          localStorage.setItem(PLAN_KEY, String(clientData.plan || 30));
          localStorage.setItem('nono_session_id', currentSessionId);
          
          setUser({ ...clientData, deviceId });
          setIsLocalAuth(false);
          return { success: true };
        }
      } catch (err) {
        console.error('[Auth] Erro no login Supabase:', err);
      }
    }

    // Fallback local - só funciona se Supabase estiver offline OU usuário não existe no banco
    // E só funciona se NÃO há sessão ativa em outro dispositivo
    console.log('[Auth] Usando modo local (fallback)');
    
    if (password === VITE_APP_PASSWORD) {
      const deviceId = getDeviceId();
      const currentSessionId = `device_${deviceId}`;
      
      // Salvar localmente sem verificar sessão (offline não tem como verificar)
      const expiry = calculateExpiry(30);
      localStorage.setItem(PASSWORD_KEY, password);
      localStorage.setItem(TOKEN_KEY, 'local_fallback'); // Marcador de fallback local
      localStorage.setItem(EXPIRY_KEY, expiry.toString());
      localStorage.setItem(NAME_KEY, email);
      localStorage.setItem(PLAN_KEY, '30');
      localStorage.setItem('nono_session_id', currentSessionId);
      
      setUser({ name: email, plan: 30, deviceId, isLocalFallback: true });
      setIsLocalAuth(true);
      return { success: true };
    }
    
    return { success: false, error: 'Credenciais inválidas' };
  }, []);

  const logout = useCallback(async () => {
    const sessionId = localStorage.getItem('nono_session_id');
    const name = localStorage.getItem(NAME_KEY);
    
    // Limpar sessão no banco de dados
    if (supabaseAnon && sessionId && name) {
      try {
        await supabaseAnon
          .from('clients')
          .update({ 
            session_id: null,
            last_active: Date.now()
          })
          .eq('name', name);
      } catch (err) {
        console.warn('[Auth] Erro ao limpar sessão:', err);
      }
    }

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    localStorage.removeItem(NAME_KEY);
    localStorage.removeItem(PLAN_KEY);
    localStorage.removeItem(PASSWORD_KEY);
    localStorage.removeItem('nono_session_id');
    setUser(null);
    setIsLocalAuth(false);
  }, []);

const checkSession = useCallback(async () => {
    const localPassword = localStorage.getItem(PASSWORD_KEY);
    const isLocalAuth = localStorage.getItem(TOKEN_KEY) === 'local_fallback';
    
    // Verificar se é login local válido
    if (localPassword && isLocalAuth) {
      const expiry = parseInt(localStorage.getItem(EXPIRY_KEY) || '0');
      if (expiry && Date.now() < expiry) {
        const name = localStorage.getItem(NAME_KEY);
        const plan = localStorage.getItem(PLAN_KEY);
        setUser({ name, plan: parseInt(plan), deviceId: getDeviceId(), isLocalFallback: true });
        setIsLocalAuth(true);
        setLoading(false);
        return true;
      }
    }
    
    // Para login via Supabase, verificar sessão no banco
    if (supabaseAnon) {
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
        const plan = localStorage.getItem(PLAN_KEY);
        setUser({ name, plan: parseInt(plan), deviceId });
        setIsLocalAuth(false);
        setLoading(false);
        return true;
      } catch {
        logout();
        setLoading(false);
        return false;
      }
    }
    
    setLoading(false);
    return false;
  }, [logout]);

  const [authWorkerStatus, setAuthWorkerStatus] = useState('unknown');
  const authWorkerCheckRef = useRef(null);

  // Check auth worker connectivity silently
  const checkAuthWorker = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${VITE_AUTH_SERVICE_URL}/health`, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const status = response.ok ? 'online' : 'offline';
      setAuthWorkerStatus(status);
      return status;
    } catch {
      setAuthWorkerStatus('offline');
      return 'offline';
    }
  }, []);

  useEffect(() => {
    // Initial check
    checkAuthWorker();
    
    // Silent periodic check every 30 seconds
    authWorkerCheckRef.current = setInterval(checkAuthWorker, 60000);
    
    return () => {
      if (authWorkerCheckRef.current) {
        clearInterval(authWorkerCheckRef.current);
      }
    };
  }, [checkAuthWorker]);

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
    authWorkerStatus,
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
    testConnection: async () => {
      const result = {
        supabaseUrl: VITE_SUPABASE_URL || null,
        anonKey: !!VITE_SUPABASE_ANON_KEY,
        authWorkerUrl: VITE_AUTH_SERVICE_URL,
        authWorkerConnected: authWorkerStatus === 'online',
        databaseConnected: false,
        databaseError: null,
        clientsCount: 0
      };

      if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) {
        return result;
      }

      try {
        const { data, error } = await supabaseAnon
          .from('clients')
          .select('id', { count: 'exact', head: true });

        result.databaseConnected = !error;
        if (error) {
          result.databaseError = error.message;
        } else {
          result.clientsCount = data?.length || 0;
        }
      } catch (err) {
        result.databaseError = err.message;
      }

      return result;
    },
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