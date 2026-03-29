import { useState, useEffect, useCallback, useRef } from 'react';

const VALIDATION_CACHE_KEY = 'nono_channel_validation';
const VALIDATION_TIMEOUT = 5000;

function getCachedValidation() {
  try {
    const cached = localStorage.getItem(VALIDATION_CACHE_KEY);
    if (!cached) return {};
    const data = JSON.parse(cached);
    if (Date.now() - data.timestamp > 300000) return {};
    return data.results || {};
  } catch {
    return {};
  }
}

function setCachedValidation(results) {
  try {
    localStorage.setItem(VALIDATION_CACHE_KEY, JSON.stringify({
      results,
      timestamp: Date.now()
    }));
  } catch {
    // Silent fail
  }
}

export function useChannelValidator(channels = []) {
  const [validity, setValidity] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const validatingRef = useRef(false);

  const getProxyUrl = useCallback((url) => {
    if (typeof window === 'undefined') return url;
    
    const isNative = !!(window.Capacitor?.isNativePlatform?.());
    const isDev = import.meta?.env?.DEV;
    
    if (isNative || !isDev) return url;
    
    return `http://localhost:3131/?url=${encodeURIComponent(url)}`;
  }, []);

  const validateChannel = useCallback(async (channel) => {
    const url = getProxyUrl(channel.url);
    
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), VALIDATION_TIMEOUT);
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal
      });
      clearTimeout(timer);
      
      if (response.ok || response.status === 302 || response.status === 0) {
        return { valid: true, status: response.status || 200 };
      }
      return { valid: false, status: response.status };
    } catch {
      return { valid: false, status: 'error' };
    }
  }, [getProxyUrl]);

  const validateAll = useCallback(async (channelList, onProgress) => {
    if (validatingRef.current) return;
    validatingRef.current = true;
    setIsValidating(true);

    const cached = getCachedValidation();
    const results = { ...cached };
    const toValidate = channelList.filter(ch => !cached[ch.id]);

    for (let i = 0; i < toValidate.length; i++) {
      const channel = toValidate[i];
      
      if (onProgress) {
        onProgress(i + 1, toValidate.length, channel.name);
      }

      const result = await validateChannel(channel);
      results[channel.id] = result;
      
      setValidity(prev => ({ ...prev, [channel.id]: result.valid }));

      if (i < toValidate.length - 1) {
        await new Promise(r => setTimeout(r, 100));
      }
    }

    setCachedValidation(results);
    setValidity(results);
    setIsValidating(false);
    validatingRef.current = false;
  }, [validateChannel]);

  const isChannelValid = useCallback((channelId) => {
    return validity[channelId] !== false;
  }, [validity]);

  const quickCheck = useCallback(async (channel) => {
    if (validity[channel.id] !== undefined) {
      return validity[channel.id];
    }
    
    const result = await validateChannel(channel);
    setValidity(prev => ({ ...prev, [channel.id]: result.valid }));
    return result.valid;
  }, [validity, validateChannel]);

  return {
    validity,
    isValidating,
    validateAll,
    isChannelValid,
    quickCheck
  };
}

export default useChannelValidator;
