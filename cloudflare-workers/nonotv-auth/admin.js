import { getAllClients, getClientStatus, getDaysRemaining } from './kv.js';

const ADMIN_PASSWORD = 'nono2026';

function htmlResponse(html, status = 200) {
  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

export function handleAdmin(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  
  if (method === 'POST') {
    return handleAdminPost(request, path);
  }
  
  if (path === '/' || path === '') {
    return renderLogin();
  }
  
  if (path === '/admin') {
    return renderDashboard();
  }
  
  if (path === '/admin/new') {
    return renderNewClient();
  }
  
  if (path.startsWith('/admin/edit/')) {
    const id = path.split('/').pop();
    return renderEditClient(id);
  }
  
  if (path.startsWith('/admin/delete/')) {
    const id = path.split('/').pop();
    return renderDeleteClient(id);
  }
  
  if (path.startsWith('/admin/block/')) {
    const id = path.split('/').pop();
    return renderBlockClient(id);
  }
  
  if (path.startsWith('/admin/renew/')) {
    const id = path.split('/').pop();
    return renderRenewClient(id);
  }
  
  if (path.startsWith('/logout')) {
    return renderLogin();
  }
  
  return renderDashboard();
}

async function handleAdminPost(request, path) {
  const formData = await request.formData();
  const password = formData.get('p');
  
  if (path === '/' && password === ADMIN_PASSWORD) {
    return new Response('', {
      status: 302,
      headers: {
        'Location': '/admin',
        'Set-Cookie': 'admin_session=1; Path=/; HttpOnly; SameSite=Strict'
      }
    });
  }
  
  if (path === '/admin/new') {
    const name = formData.get('name');
    const password = formData.get('password');
    const whatsapp = formData.get('whatsapp');
    const plan = parseInt(formData.get('plan')) || 30;
    
    return new Response('', {
      status: 302,
      headers: { 'Location': '/admin' }
    });
  }
  
  return renderLogin();
}

function renderLogin() {
  return htmlResponse(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NonoTV Admin Elite</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    :root { --primary: #dc2626; --bg: #050505; --card: rgba(255,255,255,0.03); --border: rgba(255,255,255,0.08); --text: #f8fafc; --text-dim: #94a3b8; }
    * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
    body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; margin: 0; padding: 0; overflow-x: hidden; }
    .glow { position: fixed; width: 40vw; height: 40vw; background: radial-gradient(circle, rgba(220,38,38,0.08) 0%, transparent 70%); border-radius: 50%; z-index: -1; filter: blur(60px); }
    .glow-1 { top: -10vw; right: -10vw; }
    .glow-2 { bottom: -10vw; left: -10vw; }
    .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
    .glass { background: var(--card); backdrop-filter: blur(20px); border: 1px solid var(--border); border-radius: 24px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 60px; padding-bottom: 24px; border-bottom: 1px solid var(--border); }
    .logo { display: flex; align-items: center; gap: 16px; }
    .logo-icon { width: 42px; height: 42px; background: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 8px 16px rgba(220,38,38,0.2); }
    .logo-text { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; }
    .logo-text span { color: var(--primary); }
    .header-tag { padding: 4px 10px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 6px; font-size: 10px; font-weight: 800; color: var(--text-dim); text-transform: uppercase; letter-spacing: 2px; margin-left: 12px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
    .stat-card { padding: 24px; cursor: pointer; transition: all 0.3s; }
    .stat-card:hover { border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); }
    .stat-card.active { border-color: var(--primary); background: rgba(220,38,38,0.05); }
    .stat-label { font-size: 11px; font-weight: 700; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px; }
    .stat-value { font-size: 32px; font-weight: 800; margin-top: 8px; display: block; }
    .action-bar { display: flex; gap: 16px; margin-bottom: 32px; flex-wrap: wrap; }
    .search-box { flex: 1; min-width: 300px; }
    .search-input { width: 100%; padding: 16px 24px; background: var(--card); border: 1px solid var(--border); border-radius: 16px; color: #fff; font-size: 15px; outline: none; }
    .search-input:focus { border-color: var(--primary); background: rgba(255,255,255,0.05); }
    .btn-new { padding: 16px 32px; background: var(--primary); color: #fff; border: none; border-radius: 16px; font-weight: 700; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 8px; }
    .btn-new:hover { background: #b91c1c; transform: scale(1.02); }
    table { width: 100%; border-collapse: separate; border-spacing: 0 8px; }
    th { padding: 16px 24px; text-align: left; font-size: 11px; font-weight: 700; color: var(--text-dim); text-transform: uppercase; }
    td { padding: 20px 24px; background: var(--card); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
    td:first-child { border-left: 1px solid var(--border); border-radius: 16px 0 0 16px; }
    td:last-child { border-right: 1px solid var(--border); border-radius: 0 16px 16px 0; }
    .user-info { display: flex; align-items: center; gap: 16px; }
    .avatar { width: 44px; height: 44px; border-radius: 12px; background: #1e293b; display: flex; align-items:center; justify-content:center; font-weight: 800; }
    .name { font-weight: 600; font-size: 15px; margin: 0; }
    .id-tag { font-size: 10px; color: var(--text-dim); }
    .badge { padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .badge-active { background: rgba(16,185,129,0.1); color: #10b981; }
    .badge-expired { background: rgba(245,158,11,0.1); color: #f59e0b; }
    .badge-warning { background: rgba(239,68,68,0.1); color: #ef4444; animation: pulse 2s infinite; }
    .badge-blocked { background: rgba(239,68,68,0.2); color: #ef4444; }
    .actions { display: flex; gap: 10px; align-items: center; }
    .wa-btn { padding: 8px 16px; background: #25D366; color: #fff; border-radius: 10px; text-decoration: none; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; gap: 8px; transition: all 0.3s; box-shadow: 0 4px 12px rgba(37,211,102,0.2); }
    .wa-btn:hover { background: #22c35e; transform: translateY(-2px); }
    .btn-icon { width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--border); background: rgba(255,255,255,0.03); color: var(--text-dim); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .btn-icon:hover { background: rgba(255,255,255,0.1); color: #fff; }
    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }
  </style>
</head>
<body>
  <div class="glow glow-1"></div>
  <div class="glow glow-2"></div>
  <div style="height: 100vh; display: flex; align-items: center; justify-content: center;">
    <div class="glass modal" style="max-width: 400px; text-align: center;">
      <div class="logo" style="justify-content: center; margin-bottom: 32px;">
        <div class="logo-icon">▶</div>
        <div class="logo-text">Nono<span>TV</span></div>
      </div>
      <form method="POST">
        <div class="form-group">
          <input type="password" name="p" class="form-control" placeholder="Chave Admin" required style="text-align:center">
        </div>
        <button type="submit" class="btn-new" style="width: 100%; justify-content: center;">Acessar Painel</button>
      </form>
    </div>
  </div>
</body>
</html>`);
}

function renderDashboard() {
  return htmlResponse(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NonoTV Admin - Dashboard</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    :root { --primary: #dc2626; --bg: #050505; --card: rgba(255,255,255,0.03); --border: rgba(255,255,255,0.08); --text: #f8fafc; --text-dim: #94a3b8; }
    * { box-sizing: border-box; -webkit-font-smoothing: antialiased; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; }
    .glow { position: fixed; width: 40vw; height: 40vw; background: radial-gradient(circle, rgba(220,38,38,0.08) 0%, transparent 70%); border-radius: 50%; z-index: -1; filter: blur(60px); }
    .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
    .glass { background: var(--card); backdrop-filter: blur(20px); border: 1px solid var(--border); border-radius: 24px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 60px; padding-bottom: 24px; border-bottom: 1px solid var(--border); }
    .logo { display: flex; align-items: center; gap: 16px; }
    .logo-icon { width: 42px; height: 42px; background: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 8px 16px rgba(220,38,38,0.2); }
    .logo-text { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; }
    .logo-text span { color: var(--primary); }
    .header-tag { padding: 4px 10px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 6px; font-size: 10px; font-weight: 800; color: var(--text-dim); text-transform: uppercase; letter-spacing: 2px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
    .stat-card { padding: 24px; border: 1px solid var(--border); border-radius: 16px; transition: all 0.3s; }
    .stat-label { font-size: 11px; font-weight: 700; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px; }
    .stat-value { font-size: 32px; font-weight: 800; margin-top: 8px; display: block; }
    .action-bar { display: flex; gap: 16px; margin-bottom: 32px; flex-wrap: wrap; }
    .btn-new { padding: 16px 32px; background: var(--primary); color: #fff; border: none; border-radius: 16px; font-weight: 700; cursor: pointer; transition: all 0.3s; text-decoration: none; }
    .btn-new:hover { background: #b91c1c; }
    table { width: 100%; border-collapse: separate; border-spacing: 0 8px; }
    th { padding: 16px 24px; text-align: left; font-size: 11px; font-weight: 700; color: var(--text-dim); text-transform: uppercase; }
    td { padding: 20px 24px; background: var(--card); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
    td:first-child { border-left: 1px solid var(--border); border-radius: 16px 0 0 16px; }
    td:last-child { border-right: 1px solid var(--border); border-radius: 0 16px 16px 0; }
    .name { font-weight: 600; font-size: 15px; }
    .id-tag { font-size: 10px; color: var(--text-dim); }
    .badge { padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .badge-active { background: rgba(16,185,129,0.1); color: #10b981; }
    .badge-expired { background: rgba(245,158,11,0.1); color: #f59e0b; }
    .badge-warning { background: rgba(239,68,68,0.1); color: #ef4444; animation: pulse 2s infinite; }
    .badge-blocked { background: rgba(239,68,68,0.2); color: #ef4444; }
    .actions { display: flex; gap: 10px; align-items: center; }
    .wa-btn { padding: 8px 16px; background: #25D366; color: #fff; border-radius: 10px; text-decoration: none; font-size: 12px; font-weight: 700; }
    .btn-icon { width: 36px; height: 36px; border: 1px solid var(--border); border-radius: 10px; background: transparent; color: var(--text-dim); cursor: pointer; display: flex; align-items: center; justify-content: center; text-decoration: none; }
    .btn-icon:hover { background: rgba(255,255,255,0.1); color: #fff; }
    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }
    .days { font-size: 11px; color: var(--text-dim); }
  </style>
</head>
<body>
  <div class="glow glow-1"></div>
  <div class="glow glow-2"></div>
  <div class="container">
    <div class="header">
      <div class="logo">
        <div class="logo-icon">▶</div>
        <div class="logo-text">Nono<span>TV</span></div>
        <span class="header-tag">Admin</span>
      </div>
    </div>
    <div class="stats-grid">
      <div class="stat-card active" onclick="filter('all')">
        <div class="stat-label">Total</div>
        <div class="stat-value" id="stat-total">0</div>
      </div>
      <div class="stat-card" onclick="filter('active')">
        <div class="stat-label">Ativos</div>
        <div class="stat-value" id="stat-active" style="color:#10b981">0</div>
      </div>
      <div class="stat-card" onclick="filter('warning')">
        <div class="stat-label">Expirando</div>
        <div class="stat-value" id="stat-warning" style="color:#ef4444">0</div>
      </div>
      <div class="stat-card" onclick="filter('expired')">
        <div class="stat-label">Expirados</div>
        <div class="stat-value" id="stat-expired" style="color:#f59e0b">0</div>
      </div>
    </div>
    <div class="action-bar">
      <a href="/admin/new" class="btn-new">+ Novo Cliente</a>
    </div>
    <table>
      <thead>
        <tr>
          <th>Cliente</th>
          <th>WhatsApp</th>
          <th>Plano</th>
          <th>Expires</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody id="clients-list"></tbody>
    </table>
  </div>
  <script>
    async function loadClients() {
      try {
        const res = await fetch('/api/clients');
        const data = await res.json();
        
        document.getElementById('stat-total').textContent = data.stats.total;
        document.getElementById('stat-active').textContent = data.stats.active;
        document.getElementById('stat-warning').textContent = data.stats.warning;
        document.getElementById('stat-expired').textContent = data.stats.expired;
        
        const tbody = document.getElementById('clients-list');
        tbody.innerHTML = data.clients.map(c => \`
          <tr>
            <td>
              <div class="name">\${c.name}</div>
              <div class="id-tag">\${c.id}</div>
            </td>
            <td>\${c.whatsapp || '-'}</td>
            <td>\${c.plan} dias</td>
            <td>
              <div>\${c.daysRemaining} dias</div>
              <div class="days">\${new Date(c.expires).toLocaleDateString('pt-BR')}</div>
            </td>
            <td><span class="badge badge-\${c.status}">\${c.status}</span></td>
            <td>
              <div class="actions">
                \${c.whatsapp ? \`<a href="https://wa.me/55\${c.whatsapp}" target="_blank" class="wa-btn">WhatsApp</a>\` : ''}
                <a href="/admin/edit/\${c.id}" class="btn-icon">✏️</a>
                <a href="/admin/block/\${c.id}" class="btn-icon" style="color:#ef4444">🚫</a>
              </div>
            </td>
          </tr>
        \`).join('');
      } catch (e) {
        console.error(e);
      }
    }
    loadClients();
  </script>
</body>
</html>`);
}

function renderNewClient() {
  return htmlResponse(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NonoTV - Novo Cliente</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    :root { --primary: #dc2626; --bg: #050505; --card: rgba(255,255,255,0.03); --border: rgba(255,255,255,0.08); --text: #f8fafc; --text-dim: #94a3b8; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; }
    .glow { position: fixed; width: 40vw; height: 40vw; background: radial-gradient(circle, rgba(220,38,38,0.08) 0%, transparent 70%); border-radius: 50%; z-index: -1; filter: blur(60px); }
    .container { max-width: 500px; margin: 0 auto; padding: 40px 20px; }
    .glass { background: var(--card); border: 1px solid var(--border); border-radius: 24px; padding: 40px; }
    .logo { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
    .logo-icon { width: 42px; height: 42px; background: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .logo-text { font-size: 22px; font-weight: 900; text-transform: uppercase; }
    .logo-text span { color: var(--primary); }
    .form-group { margin-bottom: 24px; }
    .form-label { display: block; font-size: 11px; font-weight: 700; color: var(--text-dim); margin-bottom: 8px; text-transform: uppercase; }
    .form-control { width: 100%; padding: 14px 18px; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 12px; color: #fff; font-size: 15px; outline: none; }
    .form-control:focus { border-color: var(--primary); }
    .btn-new { padding: 16px 32px; background: var(--primary); color: #fff; border: none; border-radius: 16px; font-weight: 700; cursor: pointer; width: 100%; }
    .btn-new:hover { background: #b91c1c; }
  </style>
</head>
<body>
  <div class="glow glow-1"></div>
  <div class="glow glow-2"></div>
  <div class="container">
    <div class="glass">
      <div class="logo">
        <div class="logo-icon">▶</div>
        <div class="logo-text">Nono<span>TV</span></div>
      </div>
      <h2 style="margin-bottom:24px">Novo Cliente</h2>
      <form method="POST" action="/admin/new">
        <div class="form-group">
          <label class="form-label">Nome</label>
          <input type="text" name="name" class="form-control" placeholder="Usuário" required>
        </div>
        <div class="form-group">
          <label class="form-label">Senha</label>
          <input type="password" name="password" class="form-control" placeholder="Senha" required>
        </div>
        <div class="form-group">
          <label class="form-label">WhatsApp (opcional)</label>
          <input type="text" name="whatsapp" class="form-control" placeholder="11999999999">
        </div>
        <div class="form-group">
          <label class="form-label">Plano</label>
          <select name="plan" class="form-control">
            <option value="30">30 dias - R$ 30</option>
            <option value="60">60 dias - R$ 55</option>
            <option value="90">90 dias - R$ 75</option>
          </select>
        </div>
        <button type="submit" class="btn-new">Criar Cliente</button>
      </form>
      <a href="/admin" style="display:block;margin-top:16px;color:var(--text-dim);text-align:center">← Voltar</a>
    </div>
  </div>
</body>
</html>`);
}

function renderEditClient(id) {
  return htmlResponse(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NonoTV - Editar Cliente</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    :root { --primary: #dc2626; --bg: #050505; --card: rgba(255,255,255,0.03); --border: rgba(255,255,255,0.08); --text: #f8fafc; --text-dim: #94a3b8; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; }
    .container { max-width: 500px; margin: 0 auto; padding: 40px 20px; }
    .glass { background: var(--card); border: 1px solid var(--border); border-radius: 24px; padding: 40px; }
    .logo { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
    .logo-icon { width: 42px; height: 42px; background: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .logo-text { font-size: 22px; font-weight: 900; text-transform: uppercase; }
    .logo-text span { color: var(--primary); }
    .form-group { margin-bottom: 24px; }
    .form-label { display: block; font-size: 11px; font-weight: 700; color: var(--text-dim); margin-bottom: 8px; text-transform: uppercase; }
    .form-control { width: 100%; padding: 14px 18px; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 12px; color: #fff; font-size: 15px; }
    .btn-new { padding: 16px 32px; background: var(--primary); color: #fff; border: none; border-radius: 16px; font-weight: 700; cursor: pointer; width: 100%; }
  </style>
</head>
<body>
  <div class="container">
    <div class="glass">
      <div class="logo">
        <div class="logo-icon">▶</div>
        <div class="logo-text">Nono<span>TV</span></div>
      </div>
      <h2 style="margin-bottom:24px">Editar Cliente</h2>
      <p style="color:var(--text-dim);margin-bottom:24px">ID: ${id}</p>
      <a href="/admin" style="color:var(--text-dim)">← Voltar</a>
    </div>
  </div>
</body>
</html>`);
}

function renderDeleteClient(id) {
  return new Response('', {
    status: 302,
    headers: { 'Location': '/admin' }
  });
}

function renderBlockClient(id) {
  return new Response('', {
    status: 302,
    headers: { 'Location': '/admin' }
  });
}

function renderRenewClient(id) {
  return new Response('', {
    status: 302,
    headers: { 'Location': '/admin' }
  });
}