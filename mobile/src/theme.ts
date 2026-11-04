export const theme = {
  colors: {
    bg: '#f4f8f1',
    card: '#ffffff',
    primary: '#2f7d32',
    primaryDark: '#1b5e20',
    accent: '#8bbf6a',
    text: '#1f2a1c',
    muted: '#6b7d64',
    border: '#dde6d6',
    chip: '#e7f1e0',
  },
  radius: 14,
  spacing: (n: number) => n * 8,
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
