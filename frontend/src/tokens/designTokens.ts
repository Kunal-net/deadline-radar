/**
 * Deadline Radar Design System Tokens
 * Source of Truth: Stitch Project 17354903279475530867
 *
 * Visual Character: Editorial, calm, intellectually grounded, typography-led.
 * Strictly sharp 0px geometry, flat tonal depth, hairline separators.
 */

export const colors = {
  // Canvas & Surfaces
  canvas: '#F7F5F0', // Warm linen canvas paper
  canvasPaper: '#F7F5F0',
  surface: '#FBF9F4',
  surfaceBright: '#FBF9F4',
  surfaceCream: '#EFECE4', // Subtle paper tier
  surfaceTint: '#E5E1D6',
  surfaceVariant: '#E4E2DD',
  surfaceDim: '#DBDAD5',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F5F3EE',
  surfaceContainer: '#F0EEE9',
  surfaceContainerHigh: '#EAE8E3',
  surfaceContainerHighest: '#E4E2DD',

  // Typography & Inks
  inkPrimary: '#1A1715', // Deep soot black primary ink
  inkSecondary: '#57524D', // Warm stone secondary ink
  inkMuted: '#8C827A', // Muted metadata ink

  // Semantic & Accents
  accentTerracotta: '#C85A32', // Grounded terracotta urgency accent
  statusWarning: '#B85324', // Capacity & friction warning
  statusAlert: '#A63224', // Critical deadline alert
  error: '#BA1A1A',

  // Structural Borders
  borderHairline: 'rgba(26, 23, 21, 0.12)',
  outline: '#7E7570',
  outlineVariant: '#D0C4BE',

  // Fixed & Inverse
  inverseSurface: '#30312E',
  inverseOnSurface: '#F2F1EC',
  primaryFixed: '#E9E1DD',
  primaryFixedDim: '#CCC5C1',
} as const;

export const typography = {
  fonts: {
    display: 'Epilogue, sans-serif',
    headline: 'Epilogue, sans-serif',
    body: 'Manrope, sans-serif',
    label: 'Manrope, sans-serif',
    numeric: 'Epilogue, sans-serif',
  },
  styles: {
    displayHero: {
      fontFamily: 'Epilogue',
      fontSize: '56px',
      fontWeight: '600',
      lineHeight: '64px',
      letterSpacing: '-0.03em',
    },
    displayHeroMobile: {
      fontFamily: 'Epilogue',
      fontSize: '36px',
      fontWeight: '600',
      lineHeight: '44px',
      letterSpacing: '-0.02em',
    },
    headlineXl: {
      fontFamily: 'Epilogue',
      fontSize: '40px',
      fontWeight: '600',
      lineHeight: '48px',
      letterSpacing: '-0.025em',
    },
    headlineXlMobile: {
      fontFamily: 'Epilogue',
      fontSize: '28px',
      fontWeight: '600',
      lineHeight: '36px',
      letterSpacing: '-0.02em',
    },
    headlineLg: {
      fontFamily: 'Epilogue',
      fontSize: '28px',
      fontWeight: '600',
      lineHeight: '36px',
      letterSpacing: '-0.015em',
    },
    headlineMd: {
      fontFamily: 'Epilogue',
      fontSize: '22px',
      fontWeight: '600',
      lineHeight: '30px',
      letterSpacing: '-0.01em',
    },
    bodyXl: {
      fontFamily: 'Manrope',
      fontSize: '20px',
      fontWeight: '400',
      lineHeight: '32px',
      letterSpacing: '-0.01em',
    },
    bodyLg: {
      fontFamily: 'Manrope',
      fontSize: '17px',
      fontWeight: '400',
      lineHeight: '28px',
    },
    bodyMd: {
      fontFamily: 'Manrope',
      fontSize: '15px',
      fontWeight: '400',
      lineHeight: '24px',
    },
    labelLg: {
      fontFamily: 'Manrope',
      fontSize: '14px',
      fontWeight: '600',
      lineHeight: '20px',
      letterSpacing: '0.01em',
    },
    labelMd: {
      fontFamily: 'Manrope',
      fontSize: '12px',
      fontWeight: '500',
      lineHeight: '16px',
      letterSpacing: '0.02em',
    },
    numericHero: {
      fontFamily: 'Epilogue',
      fontSize: '72px',
      fontWeight: '500',
      lineHeight: '72px',
      letterSpacing: '-0.04em',
    },
    numericHeroMobile: {
      fontFamily: 'Epilogue',
      fontSize: '48px',
      fontWeight: '500',
      lineHeight: '48px',
      letterSpacing: '-0.03em',
    },
  },
} as const;

export const spacing = {
  margin: '4rem', // 64px Desktop
  marginTablet: '2rem', // 32px Tablet
  marginMobile: '1.25rem', // 20px Mobile
  gutter: '2.5rem', // 40px Desktop
  gutterMobile: '1rem', // 16px Mobile
  xs: '0.5rem', // 8px
  sm: '0.75rem', // 12px
  md: '1.5rem', // 24px
  lg: '2.5rem', // 40px
  xl: '4.5rem', // 72px
  '2xl': '7rem', // 112px
} as const;

export const shape = {
  borderRadius: '0px',
  markerSize: '6px',
} as const;

export const canonicalAssets = {
  focusWorkspace: '/assets/focus-workspace.jpg', // Person/Laptop: Work, Focus, Today
  architectDesk: '/assets/planning-architect-desk.jpg', // Desk/Notes: Planning, Timeline, Add Work
  hourglassTemporal: '/assets/hourglass-temporal.jpg', // Hourglass: Time, Radar, Deadlines
  logoWordmark: '/assets/logo-wordmark.svg',
  userAvatar: '/assets/user-avatar.jpg',
} as const;

export default {
  colors,
  typography,
  spacing,
  shape,
  canonicalAssets,
};
