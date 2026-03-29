/**
 * Cloudflare Worker - EPG Proxy Server
 * 
 * Deploy instructions:
 * 1. Create a Cloudflare Workers account
 * 2. Create a new Worker
 * 3. Paste this code
 * 4. Add your custom domain or use workers.dev subdomain
 * 
 * Usage:
 * https://your-worker.workers.dev/epg?url={encoded_epg_url}
 */

const API_VERSION = '1.0.0';
const CACHE_TTL = 3600;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

async function handleRequest(event) {
  const url = new URL(event.request.url);
  
  if (url.pathname === '/') {
    return new Response(JSON.stringify({
      status: 'ok',
      version: API_VERSION,
      endpoints: {
        epg: '/epg?url=<encoded_url>',
        health: '/health',
        cache: '/cache?action=clear'
      }
    }, null, 2), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
  
  if (url.pathname === '/health') {
    return new Response(JSON.stringify({
      status: 'healthy',
      version: API_VERSION,
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
  
  if (url.pathname === '/cache' && url.searchParams.get('action') === 'clear') {
    const cache = caches.default;
    await cache.delete(event.request);
    return new Response(JSON.stringify({ status: 'cache_cleared' }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
  
  if (url.pathname === '/epg') {
    const targetUrl = url.searchParams.get('url');
    
    if (!targetUrl) {
      return new Response(JSON.stringify({ error: 'Missing url parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const decodedUrl = decodeURIComponent(targetUrl);
    const cacheKey = new Request(decodedUrl);
    
    let response;
    const cache = caches.default;
    
    try {
      response = await cache.match(cacheKey);
      
      if (!response) {
        response = await fetch(decodedUrl, {
          headers: {
            'User-Agent': 'NonoTV/1.0',
            'Accept': 'application/xml, text/xml, */*'
          }
        });
        
        if (!response.ok) {
          return new Response(JSON.stringify({
            error: 'Failed to fetch EPG',
            status: response.status
          }), {
            status: response.status,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        
        const text = await response.text();
        
        response = new Response(text, {
          status: 200,
          headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': `public, max-age=${CACHE_TTL}`,
            'X-Cache': 'MISS',
            ...corsHeaders
          }
        });
        
        event.waitUntil(cache.put(cacheKey, response.clone()));
      } else {
        response = new Response(response.body, {
          headers: {
            ...response.headers,
            'X-Cache': 'HIT'
          }
        });
      }
      
      return response;
      
    } catch (error) {
      return new Response(JSON.stringify({
        error: error.message,
        url: decodedUrl
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }
  
  return new Response('Not Found', { status: 404 });
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event));
});
