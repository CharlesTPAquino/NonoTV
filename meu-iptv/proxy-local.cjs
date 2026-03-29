const http = require('http');
const https = require('https');
const { parse } = require('url');

const PORT = 3131;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const query = parse(req.url, true).query;
  let targetUrl = query.url || req.url.slice(1);

  if (!targetUrl || !targetUrl.startsWith('http')) {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('NonoTV Proxy Local Ativo! Use: http://localhost:3131/?url=SUA_URL');
    return;
  }

  console.log(`\n[Proxy] 📡 Solicitando: ${targetUrl}`);

  function pipeRequest(currentUrl, redirectCount = 0) {
    if (redirectCount > 5) {
      console.error(`[Erro] 🛑 Muitos redirecionamentos.`);
      res.writeHead(500);
      res.end('Erro: Muitos redirecionamentos do servidor IPTV.');
      return;
    }

    try {
      const options = parse(currentUrl);
      const client = options.protocol === 'https:' ? https : http;

      const proxyReq = client.request(currentUrl, {
        method: req.method,
        headers: {
          'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
          'Referer': options.origin || options.host,
          'Accept': '*/*',
          'Connection': 'keep-alive',
          'Range': req.headers.range || ''
        }
      }, (proxyRes) => {
        if ([301, 302, 307, 308].includes(proxyRes.statusCode) && proxyRes.headers.location) {
          console.log(`[Proxy] ↪️ Redirecionando para: ${proxyRes.headers.location}`);
          pipeRequest(proxyRes.headers.location, redirectCount + 1);
          return;
        }

        console.log(`[Proxy] ✅ Resposta: ${proxyRes.statusCode} (${proxyRes.headers['content-type'] || 'unknown type'})`);

        const headers = { ...proxyRes.headers };
        headers['Access-Control-Allow-Origin'] = '*';
        headers['Access-Control-Allow-Headers'] = '*';
        headers['Access-Control-Expose-Headers'] = 'Content-Length, Content-Range, Accept-Ranges';
        headers['Accept-Ranges'] = 'bytes';
        
        delete headers['content-security-policy'];
        delete headers['x-frame-options'];

        res.writeHead(proxyRes.statusCode, headers);
        proxyRes.pipe(res);
      });

      proxyReq.on('error', (e) => {
        if (e.code === 'ENOTFOUND') {
          console.error(`[Erro] 🛑 Domínio não encontrado: ${options.hostname}. O seu provedor pode estar bloqueando este site.`);
        } else {
          console.error(`[Erro] ❌ Falha na conexão: ${e.message}`);
        }
        res.writeHead(500);
        res.end(`Erro de Conexão: ${e.message}`);
      });

      proxyReq.end();
    } catch (err) {
      console.error(`[Erro] 💥 Falha fatal no proxy: ${err.message}`);
      res.writeHead(500);
      res.end('Erro interno no proxy local.');
    }
  }

  pipeRequest(targetUrl);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 NONOTV TURBO-PROXY ATIVO`);
  console.log(`📍 Endereço Local: http://localhost:${PORT}`);
  console.log(`🌐 Endereço Rede:  http://0.0.0.0:${PORT}`);
  console.log(`🎭 Modo: Camuflagem VLC Ativa | Seguindo Redirecionamentos\n`);
});
