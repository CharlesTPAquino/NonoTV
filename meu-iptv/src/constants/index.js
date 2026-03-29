/**
 * NonoTV Constants
 * Centraliza todas as constantes do projeto para melhor manutenibilidade
 */

export const ADULT_CONTENT_REGEX = /adulto|sexo|hot|xxx|18\+|porno/i;

export const NAVIGATION = {
  ARROW_THRESHOLD: 20,
  MIN_DISTANCE: 100,
  Z_INDEX_FOCUSED: 100
};

export const UI = {
  ANIMATION_DURATION: 200,
  BLUR_LARGE: 120,
  BLUR_MEDIUM: 150,
  FOCUS_SCALE: 1.05,
  FOCUS_BOX_SHADOW: '0 0 0 4px #F7941D, 0 0 20px rgba(247, 148, 29, 0.5)'
};

export const API = {
  CONNECT_TIMEOUT: 30000,
  READ_TIMEOUT: 30000,
  SYNC_DURATION: 3000
};

export const CACHE = {
  PREFIX: 'nono_v3_',
  KEY_LENGTH: 32
};

export const FILTER = {
  DEFAULT_CATEGORY: 'All',
  DEFAULT_GROUP: 'All'
};