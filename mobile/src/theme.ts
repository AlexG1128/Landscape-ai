// Elegant, modern design system for Landscape AI.

export const theme = {
  colors: {
    // Neutrals (clean, airy)
    bg: '#fbfcfa',
    surface: '#ffffff',
    surfaceAlt: '#f3f6f1',
    border: '#e6ece2',
    overlay: 'rgba(23, 37, 20, 0.45)',

    // Brand greens (refined, not neon)
    primary: '#2e6b43',
    primaryDark: '#1d4a2d',
    primarySoft: '#e8f1ea',
    accent: '#c7a44a', // warm gold accent for elegance

    // Text
    text: '#1a2419',
    textMuted: '#5f6f5a',
    textFaint: '#92a08c',
    onPrimary: '#ffffff',

    // Status
    danger: '#b23b3b',
    success: '#2e6b43',
  },

  radius: { sm: 10, md: 16, lg: 22, pill: 999 },

  spacing: (n: number) => n * 8,

  shadow: {
    card: {
      shadowColor: '#1a2419',
      shadowOpacity: 0.06,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    floating: {
      shadowColor: '#1a2419',
      shadowOpacity: 0.12,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    },
  },

  font: {
    h1: { fontSize: 30, fontWeight: '800' as const, letterSpacing: -0.5 },
    h2: { fontSize: 22, fontWeight: '800' as const, letterSpacing: -0.3 },
    h3: { fontSize: 17, fontWeight: '700' as const },
    body: { fontSize: 15, fontWeight: '400' as const },
    label: { fontSize: 13, fontWeight: '600' as const },
    caption: { fontSize: 12, fontWeight: '500' as const },
  },
};

export const categoryEmoji: Record<string, string> = {
  flower: '🌸',
  shrub: '🌳',
  tree: '🌲',
  vegetable: '🥕',
  herb: '🌿',
  groundcover: '🍃',
  grass: '🌾',
  seed: '🌱',
};

// A distinct, tasteful color per category — used for catalog imagery + chips.
export const categoryColor: Record<string, string> = {
  flower: '#d98bb0',
  shrub: '#5a9e6f',
  tree: '#3f7d52',
  vegetable: '#d98b4a',
  herb: '#6fae6f',
  groundcover: '#7bbf8a',
  grass: '#c7a44a',
  seed: '#a9843f',
};
