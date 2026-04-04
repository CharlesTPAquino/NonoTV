/**
 * NonoTV — Abort Signal Compatível
 * Fallback para AbortSignal.timeout que não existe em WebViews antigas
 */

export function createTimeoutSignal(timeoutMs) {
  if (typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(timeoutMs);
  }
  
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  
  const originalAbort = controller.abort.bind(controller);
  controller.abort = (reason) => {
    clearTimeout(timer);
    originalAbort(reason);
  };
  
  return controller.signal;
}

export default createTimeoutSignal;
