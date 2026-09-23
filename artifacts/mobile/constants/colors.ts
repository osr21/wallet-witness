/**
 * Wallet Witness — dark noir design tokens
 * Derived from artifacts/wallet-witness/src/index.css
 * Both light and dark keys use the same dark palette — this is a dark-only app.
 */

const darkTheme = {
  // Legacy aliases
  text: '#fafafa',
  tint: '#f59f0a',

  // Core surfaces
  background: '#090e1a',
  foreground: '#fafafa',

  // Cards / elevated surfaces
  card: '#0f1729',
  cardForeground: '#fafafa',

  // Primary action color — amber/gold
  primary: '#f59f0a',
  primaryForeground: '#090e1a',

  // Secondary — deep navy blue
  secondary: '#182543',
  secondaryForeground: '#fafafa',

  // Muted / subdued elements
  muted: '#141f38',
  mutedForeground: '#94a3b8',

  // Accent highlights
  accent: '#182543',
  accentForeground: '#f59f0a',

  // Destructive actions
  destructive: '#ef4343',
  destructiveForeground: '#fafafa',

  // Success
  success: '#21c45d',
  successForeground: '#fafafa',

  // Borders and inputs
  border: '#182543',
  input: '#182543',
};

const colors = {
  light: darkTheme,
  dark: darkTheme,
  // --radius: 0.25rem = 4px — sharp, noir style
  radius: 4,
};

export default colors;
