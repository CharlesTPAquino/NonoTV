const http = require('http');
const https = require('https');
const { parse } = require('url');

const PORT = 3131;

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const query = parse(req.url, true).query;
  const targetUrl = query.url;

  if (!targetUrl) {
    res.writeHead(400);
    res.end('Falta o parâmetro ?url=');
    return;
  }

  console.log(`[Proxy] 📡 Solicitando: ${targetUrl}`);

  function pipeRequest(currentUrl, redirectCount = 0) {
    if (redirectCount > 5) {
      res.writeHead(508);
      res.end('Erro: Muitos redirecionamentos');
      return;
    }

    try {
      const options = parse(currentUrl);
      const client = options.protocol === 'https:' ? https : http;

      const proxyReq = client.request(currentUrl, {
        method: req.method,
        headers: {
          'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
          'Referer': `http://${options.host}/`,
          'Accept': '*/*',
          'Connection': 'keep-alive',
          'Range': req.headers.range || '',
          'X-Forwarded-For': '127.0.0.1'
        },
        timeout: 60000 
      }, (proxyRes) => {
        // TRATAMENTO DE REDIRECIONAMENTO (CRÍTICO!)
        if ([301, 302, 303, 307, 308].includes(proxyRes.statusCode) && proxyRes.headers.location) {
          const nextUrl = proxyRes.headers.location.startsWith('http') 
            ? proxyRes.headers.location 
            : `${options.protocol}//${options.host}${proxyRes.headers.location}`;
          
          console.log(`[Proxy] ↪️ Redirecionando para: ${nextUrl}`);
          pipeRequest(nextUrl, redirectCount + 1);
          return;
        }

        console.log(`[Proxy] ✅ Resposta: ${proxyRes.statusCode} (${proxyRes.headers['content-type'] || 'unknown'})`);

        const headers = { ...proxyRes.headers };
        headers['Access-Control-Allow-Origin'] = '*';
        headers['Access-Control-Allow-Headers'] = '*';
        headers['Access-Control-Expose-Headers'] = 'Content-Length, Content-Range, Accept-Ranges';
        headers['Accept-Ranges'] = 'bytes';
        
        // Remove headers de segurança que impedem o player
        delete headers['content-security-policy'];
        delete headers['x-frame-options'];

        res.writeHead(proxyRes.statusCode, headers);
        proxyRes.pipe(res);
      });

      proxyReq.on('error', (e) => {
        console.error(`[Erro] ❌ Falha na conexão: ${e.message}`);
        if (!res.headersSent) {
          res.writeHead(502);
          res.end(`Bad Gateway: ${e.message}`);
        }
      });

      proxyReq.on('timeout', () => {
        proxyReq.destroy();
        if (!res.headersSent) {
          res.writeHead(504);
          res.end('Gateway Timeout');
        }
      });

      proxyReq.end();
    } catch (err) {
      console.error(`[Erro] 💥 Erro interno no proxy: ${err.message}`);
      if (!res.headersSent) {
        res.writeHead(500);
        res.end(`Erro Interno: ${err.message}`);
      }
    }
  }

  pipeRequest(targetUrl);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ==========================================
  🚀 PROXY ELITE ATIVO NA PORTA ${PORT}
  🛠️  Suporte a Redirecionamento: SIM
  🛠️  Bypass de CORS: SIM
  ==========================================
  `);
});
