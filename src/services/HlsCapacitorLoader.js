/**
 * NonoTV — HLS.js Loader para Dev Proxy
 * 
 * No APK Android, o HLS.js usa XHR nativo que funciona sem CORS.
 * No dev (browser), usamos o proxy local localhost:3131.
 */

function isDev() {
  return import.meta?.env?.DEV;
}

/**
 * Cria um loader que usa proxy local no dev, XHR normal no APK.
 */
export function createDevProxyLoader(BaseLoader) {
  if (!isDev()) return null;

  return class DevProxyLoader {
    constructor(config) {
      this._loader = new BaseLoader(config);
    }

    destroy() {
      if (this._loader) this._loader.destroy();
    }

    abort() {
      if (this._loader) this._loader.abort();
    }

    load(context, config, callbacks) {
      const originalUrl = context.url;
      const proxyUrl = `http://localhost:3131/?url=${encodeURIComponent(originalUrl)}`;
      
      const proxyContext = { ...context, url: proxyUrl };
      this._loader.load(proxyContext, config, callbacks);
    }
  };
}

export { isDev };
export default { createDevProxyLoader, isDev };
