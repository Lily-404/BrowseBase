export const ITEMS_PER_PAGE = 12;
export const SKELETON_ITEMS_COUNT = 12;
export const ANIMATION_DURATION = {
  FADE_IN: 1200,
  RING_EXPAND: 800,
  TEXT_FADE: 800,
  TRANSITION: 700,
  INITIAL_DELAY: 300
};

export const CACHE_KEYS = {
  RESOURCES: 'resources',
  CATEGORIES: 'categories',
  TAGS: 'tags'
};

export const ERROR_CODES = {
  PGRST103: 'PGRST103',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

export const ROUTES = {
  HOME: '/',
  ADMIN: '/admin',
  LOGIN: '/login',
  ABOUT: '/about'
};

export const API_ENDPOINTS = {
  RESOURCES: '/resources',
  CATEGORIES: '/categories',
  TAGS: '/tags'
};

export const THEME = {
  COLORS: {
    PRIMARY: '#4D4D4D',
    SECONDARY: '#666666',
    BACKGROUND: '#F5F5F5',
    TEXT: '#1A1A1A',
    TEXT_LIGHT: '#4D4D4D',
    TEXT_LIGHTER: '#9A9A9A'
  },
  SHADOWS: {
    INNER: 'inset_-1px_-1px_2px_rgba(255,255,255,0.9),inset_1px_1px_2px_rgba(0,0,0,0.1)',
    OUTER: '0_8px_24px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.05)'
  }
}; 