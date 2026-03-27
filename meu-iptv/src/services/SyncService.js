import { Capacitor } from '@capacitor/core';

const FETCH_TIMEOUT = 8000;

export const fetchSource = async (url) => {
  const isNative = Capacitor.isNativePlatform();
  
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'User-Agent': 'NonoTV/3.0'
      },
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (response.ok) {
      return await response.text();
    }

    throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
};

export default { fetchSource };