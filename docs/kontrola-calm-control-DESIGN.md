---
name: Kontrola Calm Control
colors:
  surface: '#1A222C'
  surface-dim: '#0e141b'
  surface-bright: '#232D3B'
  surface-container-lowest: '#090f15'
  surface-container-low: '#161c23'
  surface-container: '#1a2027'
  surface-container-high: '#242a32'
  surface-container-highest: '#2f353d'
  on-surface: '#dde3ed'
  on-surface-variant: '#c4c6cf'
  inverse-surface: '#dde3ed'
  inverse-on-surface: '#2b3139'
  outline: '#8e9199'
  outline-variant: '#43474e'
  surface-tint: '#adc8f5'
  primary: '#adc8f5'
  on-primary: '#143155'
  primary-container: '#8aa4cf'
  on-primary-container: '#1e3a5f'
  inverse-primary: '#455f86'
  secondary: '#5bddac'
  on-secondary: '#003827'
  secondary-container: '#00a578'
  on-secondary-container: '#003121'
  tertiary: '#ebc076'
  on-tertiary: '#422d00'
  tertiary-container: '#c49d56'
  on-tertiary-container: '#4d3500'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#adc8f5'
  on-primary-fixed: '#001c3b'
  on-primary-fixed-variant: '#2d476d'
  secondary-fixed: '#7afac7'
  secondary-fixed-dim: '#5bddac'
  on-secondary-fixed: '#002115'
  on-secondary-fixed-variant: '#00513a'
  tertiary-fixed: '#ffdea9'
  tertiary-fixed-dim: '#ebc076'
  on-tertiary-fixed: '#271900'
  on-tertiary-fixed-variant: '#5e4100'
  background: '#0e141b'
  on-background: '#dde3ed'
  surface-variant: '#2f353d'
  semantic-debit: '#E2685E'
  text-primary: '#F5F3EE'
  text-secondary: '#64748B'
  light-background: '#FAF9F6'
  light-primary: '#1E3A5F'
  light-text: '#232323'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  currency-tabular:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  margin-mobile: 16px
  margin-desktop: 32px
  gutter: 16px
  safe-area-top: env(safe-area-inset-top)
  safe-area-bottom: env(safe-area-inset-bottom)
---

## Brand & Style

The design system is centered on the philosophy of **"Calm Control,"** specifically tailored for financial management without the associated anxiety. It bridges the gap between a high-end financial tool and a wellness application, emphasizing a judgment-free, precise, and authoritative environment.

The aesthetic follows a **Corporate Modern** style with **Minimalist** and **Tactile** influences. It prioritizes:
- **Atmospheric Depth:** Using deep navy-charcoal tones to reduce eye strain and provide a sophisticated backdrop for data.
- **Intentional Friction Reduction:** Thumb-friendly layouts optimized for mobile Progressive Web Apps (PWA) with clear "safe-area" support.
- **Status Clarity:** Differentiating between "Intent" (planned) and "Reality" (settled) through specific visual metaphors like dashed borders.
- **Generous Whitespace:** Preventing "data-density" anxiety by ensuring financial figures have room to breathe.

## Colors

The system uses a dual-mode palette with a primary focus on the **Dark Mode** experience for reduced eye strain during extended analysis.

### Dark Mode (Default)
- **Foundation:** The background is a deep navy-charcoal. Surfaces step up in brightness to `surface` and `surface-bright` to create a clear container hierarchy.
- **Primary:** An indigo-tinted blue optimized for AA contrast.
- **Semantic Accents:** 
    - **Income/Credit:** Emerald Teal (#2DB88A) for positive reinforcement.
    - **Expense/Debit:** Muted Coral (#E2685E) to indicate outflow without being jarring.
    - **Planned/Pending:** Amber-Gray (#C9A15A) to distinguish upcoming forecasts.
- **Typography:** Warm off-white for primary readability and a muted slate blue-gray for secondary metadata.

### Light Mode
- Utilizes a clean, paper-like background (#FAF9F6) with a deep indigo primary (#1E3A5F) to maintain stability and trust.

## Typography

The system uses **Manrope** for expressive headings and primary body content, providing a modern and friendly corporate feel. **Inter** is reserved for labels and financial figures to ensure maximum technical clarity.

**Implementation Rules:**
- **Numerical Formatting:** All currency amounts must use the **Brazilian format (R$ 1.234,56)** and be rendered in **Inter** with tabular figures enabled for vertical alignment.
- **Hierarchy:** Aggregated balances use `display-lg`. Metadata and category headers use `label-sm` with slightly increased tracking.
- **Mobile Scaling:** Display sizes are capped at 32px on mobile to prevent aggressive text wrapping.

## Layout & Spacing

The layout follows a **Fluid Grid** model based on a strict 8px rhythm, prioritizing one-handed mobile use (the "Thumb-Zone").

- **Mobile (Standard):** 4-column fluid grid with 16px margins. 
- **Desktop:** 12-column grid with a 1200px maximum container width and 32px margins.
- **Safe Areas:** Full support for modern device notches and home indicators. Headers must include `safe-area-top` padding, and bottom navigation or fixed buttons must include `safe-area-bottom` padding.
- **Vertical Rhythm:** 16px (2 units) for standard logical grouping; 40px (5 units) for major section separation.
- **Touch Targets:** All interactive elements maintain a minimum area of 44x44px.

## Elevation & Depth

Depth is communicated through **Tonal Layers** and subtle ambient glows rather than aggressive drop shadows.

- **Layer 0 (Canvas):** Base background (#12181F).
- **Layer 1 (Containers):** Cards and sidebars use Surface (#1A222C).
- **Layer 2 (Interactive):** Inputs, hover states, and elevated modals use Surface-Bright (#232D3B).
- **Shadows:** Only used for "floating" elements. Shadows should be highly diffused (20px+ blur), using pure black at 40% opacity in dark mode, or Primary Indigo at 6% opacity in light mode.
- **The "Intent" Layer:** Planned items remain at Level 0, using a 1.5px dashed border to signal they lack physical "weight" or permanence.

## Shapes

The design uses a consistent **Rounded** geometry (8px base) to soften the analytical nature of the data.

- **Standard Elements:** 8px (0.5rem) radius for input fields and small components.
- **Structural Containers:** 16px (1rem) radius for main dashboard cards and bottom sheets.
- **Interactive Pills:** 24px+ radius for chips and status tags to differentiate them from static containers.
- **Dashed Borders:** Exclusively used for "Planned" semantic items.

## Components

- **Buttons:** Primary buttons use `primary_color_hex` with dark text. Mobile actions should be positioned in the bottom third of the screen.
- **Navigation:** Standard 5-tab bar (Home, History, Accounts, Planned, Settings). Credit Cards are nested within the 'Accounts' tab.
- **Input Fields:** Use `surface-bright` backgrounds with a 12px radius. Currency inputs should be large and center-aligned without traditional borders.
- **Cards:** Flat design using tonal stepping. Account cards include a 2px bottom accent line in the primary or specific bank color.
- **Bottom Sheets:** The preferred mobile navigation pattern for forms and details, featuring 16px top corner radius and a visible drag-handle.
- **Status Chips:** Low-opacity background of the semantic color (e.g., 15% Emerald) with a fully opaque foreground label.
- **Transaction Rows:** 72px minimum height. Planned transactions use dashed borders and `tertiary` amber-gray coloring.