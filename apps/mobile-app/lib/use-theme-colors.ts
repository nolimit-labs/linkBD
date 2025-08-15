import { useColorScheme } from 'react-native';

// Hook to get theme colors based on the current color scheme
export function useThemeColors() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Define theme colors based on the Tailwind config
  const colors = {
    background: isDark ? '#0a140f' : '#fcfff5',
    foreground: isDark ? '#e0e0e0' : '#003300',
    primary: '#d85252',
    primaryForeground: '#ffffff',
    secondary: '#338533',
    secondaryForeground: '#ffffff',
    muted: isDark ? '#1a2b22' : '#f1f8e9',
    mutedForeground: isDark ? '#a0a0a0' : '#4caf50',
    accent: isDark ? '#2a4035' : '#e8f5e9',
    accentForeground: isDark ? '#e0e0e0' : '#1b5e20',
    border: isDark ? '#2a3b32' : '#d4e9d4',
    input: isDark ? '#2a3b32' : '#e8f5e9',
    card: isDark ? '#102118' : '#ffffff',
    cardForeground: isDark ? '#f0f0f0' : '#003300',
  };

  // Gradient colors for LinearGradient
  // For dark mode, use lighter tones for a softer gradient
  const gradientColors = isDark 
    ? ['#1a2b22', '#2a4035', '#1f3028'] // Lighter dark mode gradient
    : [colors.background, colors.accent, colors.muted];

  return {
    colors,
    gradientColors,
    isDark,
  };
}