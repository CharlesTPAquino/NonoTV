import { handleAuth } from './auth.js';
import { handleClients } from './clients.js';
import { handleAdmin } from './admin.js';

const ADMIN_PASSWORD = 'nono2026';

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function getClientId(request) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  
  if (pathParts[2] === 'clients' && pathParts[3]) {
    return pathParts[3];
  }
  
  if (url.pathname.includes('/block/') || url.pathname.includes('/renew/') || url.pathname.includes('/edit/')) {
    const idx = pathParts.findIndex(p => p === 'clients');
    if (idx !== -1 && pathParts[idx + 1]) {
      return pathParts[idx + 1];
    }
  }
  
  return null;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    console.log(`[NonoTV Auth] ${method} ${path}`);

    try {
      if (path === '/' || path === '') {
        return handleAdmin(request);
      }

      if (path.startsWith('/api/')) {
        if (path === '/api/auth/login' && method === 'POST') {
          return handleAuth.login(request, env);
        }
        
        if (path === '/api/auth/validate' && method === 'POST') {
          return handleAuth.validate(request, env);
        }

        if (path === '/api/clients' && method === 'GET') {
          return handleClients.list(request, env);
        }
        
        if (path === '/api/clients' && method === 'POST') {
          return handleClients.create(request, env);
        }

        const clientId = getClientId(request);
        
        if (clientId) {
          if (path.includes('/block') && method === 'POST') {
            return handleClients.block(request, env, clientId);
          }
          
          if (path.includes('/renew') && method === 'POST') {
            return handleClients.renew(request, env, clientId);
          }
          
          if (method === 'GET') {
            return handleClients.get(request, env, clientId);
          }
          
          if (method === 'PUT') {
            return handleClients.update(request, env, clientId);
          }
          
          if (method === 'DELETE') {
            return handleClients.delete(request, env, clientId);
          }
        }

        return jsonResponse({ error: 'Endpoint não encontrado' }, 404);
      }

      if (path.startsWith('/admin')) {
        return handleAdmin(request);
      }

      return handleAdmin(request);

    } catch (error) {
      console.error('[NonoTV Auth] Erro:', error);
      return jsonResponse({ error: error.message }, 500);
    }
  }
};