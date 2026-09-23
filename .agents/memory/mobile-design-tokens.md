---
name: Mobile design tokens
description: Color palette for the mobile artifact, derived from the wallet-witness web app's index.css
---

Dark noir palette — both `light` and `dark` keys in `constants/colors.ts` use the same values since this is a dark-only app.

Key values (from hsl conversions of wallet-witness/src/index.css):
- background: #090e1a
- foreground: #fafafa
- card: #0f1729
- primary: #f59f0a (amber/gold)
- primaryForeground: #090e1a
- secondary: #182543
- muted: #141f38
- mutedForeground: #94a3b8
- border: #182543
- destructive: #ef4343
- success: #21c45d
- radius: 4 (0.25rem → 4px, sharp/noir style)

**Why:** The web app uses HSL CSS variables; we converted to hex for React Native StyleSheet compatibility. Both keys are identical so `useColors()` always returns the dark palette regardless of device color scheme setting.
