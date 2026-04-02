let worker = null;
let pendingCallbacks = new Map();
let workerId = 0;

function getWorker() {
  if (worker) return worker;

  worker = new Worker('/m3u-worker.js');

  worker.onmessage = (e) => {
    const { type, success, channels, error, sourceId } = e.data;

    if (type === 'PARSE_RESULT') {
      const callback = pendingCallbacks.get(sourceId);
      if (callback) {
        if (success) {
          callback.resolve(channels);
        } else {
          callback.reject(new Error(error));
        }
        pendingCallbacks.delete(sourceId);
      }
    }
  };

  worker.onerror = (error) => {
    console.error('[M3UWorker] Erro:', error);
  };

  return worker;
}

export const M3UWorkerService = {
  parseM3U(content, sourceId) {
    return new Promise((resolve, reject) => {
      const w = getWorker();
      const id = `${sourceId}_${++workerId}`;

      pendingCallbacks.set(id, { resolve, reject });

      w.postMessage({
        type: 'PARSE_M3U',
        data: { content, sourceId: id }
      });

      setTimeout(() => {
        if (pendingCallbacks.has(id)) {
          pendingCallbacks.delete(id);
          reject(new Error('Timeout do worker'));
        }
      }, 30000);
    });
  },

  terminate() {
    if (worker) {
      worker.terminate();
      worker = null;
      pendingCallbacks.clear();
    }
  }
};

export default M3UWorkerService;
