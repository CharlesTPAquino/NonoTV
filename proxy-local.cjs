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

  const targetUrl = req.url.slice(1);
  if (!targetUrl || !targetUrl.startsWith('http')) {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('NonoTV Proxy Local Ativo! Escutando na porta 3131.');
    return;
  }

  console.log(`\n[Proxy] Iniciando Tunelagem: ${targetUrl}`);

  function pipeRequest(currentUrl, redirectCount = 0) {
    if (redirectCount > 5) {
      console.error(`[Erro] Muitos redirecionamentos.`);
      res.writeHead(500);
      res.end('Muitos redirecionamentos');
      return;
    }

    const options = parse(currentUrl);
    const client = options.protocol === 'https:' ? https : http;

    const proxyReq = client.request(currentUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
        'Referer': options.origin || options.host,
        'Accept': '*/*',
        'Connection': 'keep-alive'
      }
    }, (proxyRes) => {
      // TRATAMENTO DE REDIRECIONAMENTO (301, 302, 307, 308)
      if ([301, 302, 307, 308].includes(proxyRes.statusCode) && proxyRes.headers.location) {
        console.log(`[Proxy] Desviando rota para: ${proxyRes.headers.location}`);
        pipeRequest(proxyRes.headers.location, redirectCount + 1);
        return;
      }

      const headers = { ...proxyRes.headers };
      headers['Access-Control-Allow-Origin'] = '*';
      delete headers['content-security-policy'];
      delete headers['x-frame-options'];

      res.writeHead(proxyRes.statusCode, headers);
      proxyRes.pipe(res);
      
      proxyRes.on('end', () => console.log(`[Proxy] Conclusão da rota com sucesso.`));
    });

    proxyReq.on('error', (e) => {
      console.error(`[Erro] Falha no Túnel: ${e.message}`);
      res.writeHead(500);
      res.end();
    });

    proxyReq.end();
  }

  pipeRequest(targetUrl);
});

server.listen(PORT, () => {
  console.log(`\n🚀 NONOTV TURBO-PROXY ATIVO`);
  console.log(`📍 Escutando em: http://localhost:${PORT}`);
  console.log(`🎭 Modo: Camuflagem VLC Ativa | Seguindo Redirecionamentos\n`);
});
