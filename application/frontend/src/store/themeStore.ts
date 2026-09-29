import { useState, useCallback, useEffect } from 'react';

export type AppTheme = 'sovereign' | 'zoom';

export interface ThemeMeta {
  id: AppTheme;
  name: string;
  shortName: string;
  badge: string;
  icon: string;
  description: string;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    highlight: string;
    canvas: string;
  };
}

export const THEMES_META: Record<AppTheme, ThemeMeta> = {
  zoom: {
    id: 'zoom',
    name: 'Zoom Enterprise',
    shortName: 'Zoom Blue',
    badge: 'NEW PALETTE',
    icon: 'zoom',
    description: 'Crisp Arctic Slate & Deep Navy with Sky Blue accents',
    palette: {
      primary: '#0A4174',
      secondary: '#49769F',
      accent: '#4E8EA2',
      highlight: '#7BBDE8',
      canvas: '#F4F7FB',
    },
  },
  sovereign: {
    id: 'sovereign',
    name: 'Sovereign Editorial',
    shortName: 'Classic Olive',
    badge: 'EDITORIAL',
    icon: 'sovereign',
    description: 'Warm Parchment Beige, Deep Forest Olive & Antique Brass',
    palette: {
      primary: '#36452F',
      secondary: '#4A5D3F',
      accent: '#C29D53',
      highlight: '#2D6A4F',
      canvas: '#FBF9F5',
    },
  },
};

function getInitialTheme(): AppTheme {
  try {
    const saved = localStorage.getItem('manakai_app_theme');
    if (saved === 'zoom' || saved === 'sovereign') {
      applyThemeToDOM(saved);
      return saved;
    }
  } catch {}
  // Default to zoom theme as requested
  applyThemeToDOM('zoom');
  return 'zoom';
}

function applyThemeToDOM(theme: AppTheme) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
  }
}

let _theme: AppTheme = getInitialTheme();
const _listeners = new Set<() => void>();

export const themeStore = {
  getTheme: () => _theme,
  setTheme: (t: AppTheme) => {
    _theme = t;
    try {
      localStorage.setItem('manakai_app_theme', t);
    } catch {}
    applyThemeToDOM(t);
    _listeners.forEach((fn) => fn());
  },
  toggleTheme: () => {
    const next: AppTheme = _theme === 'sovereign' ? 'zoom' : 'sovereign';
    themeStore.setTheme(next);
  },
  subscribe: (fn: () => void) => {
    _listeners.add(fn);
    return () => {
      _listeners.delete(fn);
    };
  },
};

export function useTheme() {
  const [theme, setThemeState] = useState<AppTheme>(_theme);

  useEffect(() => {
    return themeStore.subscribe(() => {
      setThemeState(themeStore.getTheme());
    });
  }, []);

  const setTheme = useCallback((t: AppTheme) => {
    themeStore.setTheme(t);
  }, []);

  const toggleTheme = useCallback(() => {
    themeStore.toggleTheme();
  }, []);

  const isZoom = theme === 'zoom';
  const meta = THEMES_META[theme];

  return {
    theme,
    setTheme,
    toggleTheme,
    isZoom,
    meta,
    allThemes: THEMES_META,
  };
}
