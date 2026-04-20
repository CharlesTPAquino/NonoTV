const CLIENTS_KEY = 'clients_list';

const SUPABASE_URL = 'https://bcifnbatqrmljfrhjwnk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_fxLB_Ps97opTO9b-J56_wQ__UyOkOaP';

async function supabaseRequest(endpoint, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': options.prefer || 'return=representation'
  };
  
  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...options.headers }
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
  
  if (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH') {
    return response.json();
  }
  
  return response.json();
}

export async function getAllClients(env) {
  try {
    const data = await supabaseRequest('clients?select=*&order=created_at.desc');
    return data || [];
  } catch (e) {
    console.error('[KV] Erro getAllClients:', e.message);
    return [];
  }
}

export async function saveClients(env, clients) {
  // Não salva localmente - usa Supabase
}

export async function getClientById(env, id) {
  try {
    const data = await supabaseRequest(`clients?id=eq.${id}&select=*`);
    return data[0] || null;
  } catch {
    return null;
  }
}

export async function getClientByName(env, name) {
  try {
    const data = await supabaseRequest(`clients?name=eq.${name}&select=*`);
    return data[0] || null;
  } catch {
    return null;
  }
}

export async function createClient(env, clientData) {
  const existing = await getClientByName(env, clientData.name);
  if (existing) {
    throw new Error('Cliente já existe');
  }
  
  const newClient = {
    name: clientData.name,
    password: clientData.password,
    plan: clientData.plan || 30,
    expires: calculateExpiry(clientData.plan || 30),
    active: true,
    session_id: '',
    last_active: 0,
    login_attempts: 0,
    banned_until: 0,
    max_screens: 1,
    created_at: new Date().toISOString()
  };
  
  const created = await supabaseRequest('clients', {
    method: 'POST',
    body: JSON.stringify(newClient)
  });
  
  return created[0] || created;
}

export async function updateClient(env, id, updates) {
  const client = await getClientById(env, id);
  if (!client) {
    throw new Error('Cliente não encontrado');
  }
  
  const updated = await supabaseRequest(`clients?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  });
  
  return updated[0] || updated;
}

export async function deleteClient(env, id) {
  await supabaseRequest(`clients?id=eq.${id}`, {
    method: 'DELETE'
  });
  return true;
}

export async function blockClient(env, id, permanent = false) {
  const bannedUntil = permanent ? 0 : Date.now() + (60 * 60 * 1000);
  return await updateClient(env, id, {
    banned_until: bannedUntil,
    active: !permanent,
    session_id: ''
  });
}

export async function renewClient(env, id, days = 30) {
  const client = await getClientById(env, id);
  if (!client) {
    throw new Error('Cliente não encontrado');
  }
  
  const newExpiry = calculateExpiry(days);
  const finalExpiry = client.expires > Date.now() 
    ? client.expires + (days * 24 * 60 * 60 * 1000)
    : newExpiry;
  
  return await updateClient(env, id, {
    expires: finalExpiry,
    plan: days,
    active: true,
    banned_until: 0
  });
}

function generateId() {
  return 'cliente_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function calculateExpiry(days) {
  if (!days || days <= 0) return 0;
  return Date.now() + (days * 24 * 60 * 60 * 1000);
}

export function getClientStatus(client) {
  const now = Date.now();
  
  if (client.banned_until && client.banned_until > now) {
    return 'blocked';
  }
  
  if (!client.active) {
    return 'inactive';
  }
  
  if (client.expires && client.expires <= now) {
    return 'expired';
  }
  
  if (client.expires && client.expires - now < (7 * 24 * 60 * 60 * 1000)) {
    return 'warning';
  }
  
  return 'active';
}

export function getDaysRemaining(expires) {
  if (!expires || expires <= 0) return 0;
  const remaining = expires - Date.now();
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / (24 * 60 * 60 * 1000));
}