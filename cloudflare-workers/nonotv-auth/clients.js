import { 
  getAllClients, 
  getClientById, 
  getClientByName,
  createClient as createClientDB,
  updateClient as updateClientDB,
  deleteClient as deleteClientDB,
  blockClient as blockClientDB,
  renewClient as renewClientDB,
  getClientStatus,
  getDaysRemaining 
} from './kv.js';

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

export const handleClients = {
  async list(request, env) {
    try {
      const clients = await getAllClients(env);
      const list = clients.map(c => ({
        id: c.id,
        name: c.name,
        whatsapp: c.phone || '',
        plan: c.plan,
        expires: c.expires,
        active: c.active,
        status: getClientStatus(c),
        daysRemaining: getDaysRemaining(c.expires),
        created_at: c.created_at,
        last_active: c.last_active
      }));
      
      const stats = {
        total: list.length,
        active: list.filter(c => c.status === 'active').length,
        expired: list.filter(c => c.status === 'expired').length,
        warning: list.filter(c => c.status === 'warning').length,
        blocked: list.filter(c => c.status === 'blocked').length
      };
      
      return jsonResponse({ clients: list, stats });
    } catch (error) {
      console.error('[Clients] Erro list:', error);
      return jsonResponse({ error: error.message }, 500);
    }
  },
  
  async get(request, env, id) {
    try {
      const client = await getClientById(env, id);
      
      if (!client) {
        return jsonResponse({ error: 'Cliente não encontrado' }, 404);
      }
      
      return jsonResponse({
        id: client.id,
        name: client.name,
        whatsapp: client.phone || '',
        plan: client.plan,
        expires: client.expires,
        active: client.active,
        status: getClientStatus(client),
        daysRemaining: getDaysRemaining(client.expires),
        created_at: client.created_at,
        last_active: client.last_active,
        login_attempts: client.login_attempts,
        banned_until: client.banned_until
      });
    } catch (error) {
      console.error('[Clients] Erro get:', error);
      return jsonResponse({ error: error.message }, 500);
    }
  },
  
  async create(request, env) {
    try {
      const body = await request.json();
      const { name, password, whatsapp, plan = 30 } = body;
      
      if (!name || !password) {
        return jsonResponse({ error: 'Nome e senha são obrigatórios' }, 400);
      }
      
      const client = await createClientDB(env, { name, password, whatsapp, plan });
      
      return jsonResponse({ 
        success: true, 
        client: {
          id: client.id,
          name: client.name,
          plan: client.plan,
          expires: client.expires,
          daysRemaining: getDaysRemaining(client.expires),
          status: getClientStatus(client)
        }
      }, 201);
    } catch (error) {
      console.error('[Clients] Erro create:', error);
      return jsonResponse({ error: error.message }, 400);
    }
  },
  
  async update(request, env, id) {
    try {
      const body = await request.json();
      const updates = {};
      
      if (body.name) updates.name = body.name;
      if (body.password) updates.password = body.password;
      if (body.whatsapp) updates.whatsapp = body.whatsapp;
      if (body.plan) updates.plan = body.plan;
      if (body.active !== undefined) updates.active = body.active;
      
      const client = await updateClientDB(env, id, updates);
      
      return jsonResponse({
        success: true,
        client: {
          id: client.id,
          name: client.name,
          plan: client.plan,
          expires: client.expires,
          daysRemaining: getDaysRemaining(client.expires),
          status: getClientStatus(client)
        }
      });
    } catch (error) {
      console.error('[Clients] Erro update:', error);
      return jsonResponse({ error: error.message }, 400);
    }
  },
  
  async delete(request, env, id) {
    try {
      await deleteClientDB(env, id);
      return jsonResponse({ success: true, message: 'Cliente removido' });
    } catch (error) {
      console.error('[Clients] Erro delete:', error);
      return jsonResponse({ error: error.message }, 400);
    }
  },
  
  async block(request, env, id) {
    try {
      const body = await request.json();
      const permanent = body.permanent === true;
      
      const client = await blockClientDB(env, id, permanent);
      
      return jsonResponse({
        success: true,
        message: permanent ? 'Cliente bloqueado permanentemente' : 'Cliente bloqueado por 1 hora',
        client: {
          id: client.id,
          name: client.name,
          banned_until: client.banned_until,
          status: getClientStatus(client)
        }
      });
    } catch (error) {
      console.error('[Clients] Erro block:', error);
      return jsonResponse({ error: error.message }, 400);
    }
  },
  
  async renew(request, env, id) {
    try {
      const body = await request.json();
      const days = body.days || 30;
      
      const client = await renewClientDB(env, id, days);
      
      return jsonResponse({
        success: true,
        message: `Plano renovado por ${days} dias`,
        client: {
          id: client.id,
          name: client.name,
          plan: client.plan,
          expires: client.expires,
          daysRemaining: getDaysRemaining(client.expires),
          status: getClientStatus(client)
        }
      });
    } catch (error) {
      console.error('[Clients] Erro renew:', error);
      return jsonResponse({ error: error.message }, 400);
    }
  }
};