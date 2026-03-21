/**
 * Validador de links IPTV simples.
 * Tenta realizar um fetch parcial ou HEAD para verificar se o servidor responde.
 * Nota: Devido a restrições de CORS, alguns links válidos podem falhar na validação do navegador.
 */
export const validateLink = async (url) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos de timeout

  try {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'no-cors', // Permite "pingar" sem ser bloqueado imediatamente por CORS
      signal: controller.signal
    });
    
    // Com no-cors, o tipo da resposta é "opaque". 
    // Se chegou aqui sem dar erro, o servidor está "vivo".
    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    clearTimeout(timeoutId);
    return false;
  }
};

/**
 * Valida uma lista de canais em lote.
 */
export const validateChannels = async (channels, onUpdate) => {
  const results = {};
  for (const channel of channels) {
    const isValid = await validateLink(channel.url);
    results[channel.id] = isValid;
    if (onUpdate) onUpdate(channel.id, isValid);
  }
  return results;
};
