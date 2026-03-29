const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 3131;

const server = http.createServer((req, res) => {
  // Configura os cabeçalhos de CORS para permitir que o navegador acesse os dados
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Pega a URL de destino (ex: http://localhost:3131/http://servidor-iptv.com/filme.mp4)
  const targetUrl = req.url.slice(1);
  if (!targetUrl) {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('NonoTV Proxy Local Ativo! Use: http://localhost:3131/URL_DO_FILME');
    return;
  }

  try {
    const parsedUrl = url.parse(targetUrl);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    console.log(`[Proxy] Solicitando: ${targetUrl}`);

    const proxyReq = client.request(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18', // Finge ser o VLC para o servidor liberar o filme
        'Referer': parsedUrl.origin,
        'Accept': '*/*',
        'Connection': 'keep-alive'
      }
    }, (proxyRes) => {
      // Passa os cabeçalhos do servidor original (exceto CORS e segurança)
      const headers = { ...proxyRes.headers };
      headers['Access-Control-Allow-Origin'] = '*';
      delete headers['content-security-policy'];
      delete headers['x-frame-options'];

      res.writeHead(proxyRes.statusCode, headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (e) => {
      console.error(`[Erro Proxy]: ${e.message}`);
      res.writeHead(500);
      res.end(`Erro no Proxy: ${e.message}`);
    });

    proxyReq.end();
  } catch (err) {
    res.writeHead(400);
    res.end('URL inválida');
  }
});

server.listen(PORT, () => {
  console.log(`\n🚀 NONOTV PROXY LOCAL ATIVO`);
  console.log(`📍 Escutando em: http://localhost:${PORT}`);
  console.log(`🔧 Como usar: Adicione a URL do filme após a porta :${PORT}/\n`);
});
