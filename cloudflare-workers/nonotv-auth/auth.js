import { getClientByName, getClientById, getAllClients, getClientStatus, getDaysRemaining, updateClient } from './kv.js';

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function generateSessionId() {
  return 'device_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export const handleAuth = {
  async login(request, env) {
    try {
      const body = await request.json();
      const { name, password, deviceId } = body;
      
      if (!name || !password) {
        return jsonResponse({ error: 'Nome e senha são obrigatórios' }, 400);
      }
      
      const client = await getClientByName(env, name);
      
      if (!client) {
        return jsonResponse({ error: 'Usuário ou senha inválidos' }, 401);
      }
      
      if (client.password !== password) {
        const newAttempts = (client.login_attempts || 0) + 1;
        
        await updateClient(env, client.id, { login_attempts: newAttempts });
        
        if (newAttempts >= 7) {
          await updateClient(env, client.id, { active: false, banned_until: 0 });
          return jsonResponse({ 
            error: 'Conta bloqueada permanentemente', 
            details: 'Muitas tentativas falhas. Contate o administrador.' 
          }, 403);
        }
        
        return jsonResponse({ 
          error: 'Senha inválida', 
          attempts: newAttempts 
        }, 401);
      }
      
      const status = getClientStatus(client);
      
      if (status === 'blocked') {
        return jsonResponse({ 
          error: 'Conta bloqueada', 
          details: `Tente novamente em ${Math.ceil((client.banned_until - Date.now()) / 60000)} minuto(s)` 
        }, 403);
      }
      
      if (status === 'inactive') {
        return jsonResponse({ error: 'Conta inativa' }, 403);
      }
      
      if (status === 'expired') {
        return jsonResponse({ 
          error: 'Plano expirado', 
          details: 'Renove seu plano para continuar',
          daysRemaining: 0 
        }, 403);
      }
      
      const currentSessionId = generateSessionId();
      
      await updateClient(env, client.id, {
        session_id: currentSessionId,
        last_active: Date.now(),
        login_attempts: 0,
        active: true
      });
      
      return jsonResponse({
        success: true,
        client: {
          id: client.id,
          name: client.name,
          plan: client.plan,
          expires: client.expires,
          daysRemaining: getDaysRemaining(client.expires),
          status: 'active'
        },
        session_id: currentSessionId
      });
      
    } catch (error) {
      console.error('[Auth] Erro login:', error);
      return jsonResponse({ error: error.message }, 500);
    }
  },
  
  async validate(request, env) {
    try {
      const body = await request.json();
      const { session_id, clientId } = body;
      
      if (!session_id || !clientId) {
        return jsonResponse({ error: 'Session ID e Client ID são obrigatórios' }, 400);
      }
      
      const client = await getClientById(env, clientId);
      
      if (!client) {
        return jsonResponse({ error: 'Cliente não encontrado' }, 404);
      }
      
      if (client.session_id !== session_id) {
        return jsonResponse({ 
          error: 'Sessão inválida', 
          details: 'Faça login novamente',
          valid: false 
        }, 401);
      }
      
      const SESSION_TIMEOUT = 30 * 60 * 1000;
      const lastActive = client.last_active || 0;
      
      if (Date.now() - lastActive > SESSION_TIMEOUT) {
        await updateClient(env, client.id, { session_id: '' });
        
        return jsonResponse({ 
          error: 'Sessão expirada', 
          valid: false 
        }, 401);
      }
      
      const status = getClientStatus(client);
      
      return jsonResponse({
        valid: status === 'active',
        client: {
          id: client.id,
          name: client.name,
          plan: client.plan,
          expires: client.expires,
          daysRemaining: getDaysRemaining(client.expires),
          status
        }
      });
      
    } catch (error) {
      console.error('[Auth] Erro validate:', error);
      return jsonResponse({ error: error.message }, 500);
    }
  }
};