---
name: GymFlow Core
colors:
  surface: '#101415'
  surface-dim: '#101415'
  surface-bright: '#363a3b'
  surface-container-lowest: '#0b0f10'
  surface-container-low: '#191c1e'
  surface-container: '#1d2022'
  surface-container-high: '#272a2c'
  surface-container-highest: '#323537'
  on-surface: '#e0e3e5'
  on-surface-variant: '#bccaba'
  inverse-surface: '#e0e3e5'
  inverse-on-surface: '#2d3133'
  outline: '#869486'
  outline-variant: '#3d4a3e'
  surface-tint: '#55e07f'
  primary: '#90ffa8'
  on-primary: '#003917'
  primary-container: '#5be584'
  on-primary-container: '#00642d'
  inverse-primary: '#006d32'
  secondary: '#c5c6cc'
  on-secondary: '#2e3135'
  secondary-container: '#44474c'
  on-secondary-container: '#b3b5ba'
  tertiary: '#e4e7f0'
  on-tertiary: '#2d3137'
  tertiary-container: '#c8cbd3'
  on-tertiary-container: '#52565d'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#74fd99'
  primary-fixed-dim: '#55e07f'
  on-primary-fixed: '#00210b'
  on-primary-fixed-variant: '#005224'
  secondary-fixed: '#e1e2e8'
  secondary-fixed-dim: '#c5c6cc'
  on-secondary-fixed: '#191c20'
  on-secondary-fixed-variant: '#44474c'
  tertiary-fixed: '#dfe2eb'
  tertiary-fixed-dim: '#c3c6cf'
  on-tertiary-fixed: '#181c22'
  on-tertiary-fixed-variant: '#43474e'
  background: '#101415'
  on-background: '#e0e3e5'
  surface-variant: '#323537'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  mono-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  sidebar-width: 260px
  max-content-width: 1440px
---

## Brand & Style
The design system focuses on high-performance operational management, distancing itself from traditional fitness aesthetics in favor of a sophisticated, developer-tier B2B SaaS environment. The personality is precise, efficient, and premium.

The visual style is **Modern Corporate / Minimalist** with a "Dark Mode First" philosophy. It utilizes high-contrast typography against deep obsidian surfaces, punctuated by a high-energy mint primary color to indicate action and growth. Drawing inspiration from industry leaders like Linear and Vercel, the system relies on structured grids, subtle borders instead of heavy shadows, and intentional whitespace to manage complex data-heavy interfaces.

## Colors
This design system uses a curated dark palette designed for long-duration usage without eye strain. 

- **Primary (#5BE584):** Used exclusively for primary actions, progress indicators, and active states. It provides a vibrant contrast against the dark background.
- **Surface Architecture:** We use three tiers of darkness to create hierarchy. `#090B0F` is the base canvas, `#111418` for sidebar and navigation containers, and `#171B21` for elevated cards and modals.
- **Borders (#232833):** Defines the structure. Use thin 1px borders for all container divisions to maintain a crisp, technical look.
- **Semantic Colors:** Standardized Success, Warning, and Danger colors are used for status badges and destructive actions, ensuring clarity in management workflows.

## Typography
Inter is the foundational typeface, chosen for its exceptional legibility in data-heavy SaaS applications.

- **Scale:** Use `display-lg` sparingly for dashboard overviews. `headline-lg` serves as the primary page title.
- **Readability:** Body text uses a slightly increased line height (1.5x) to ensure large blocks of member data or reports are easy to scan.
- **Labels:** Use `label-md` in all-caps with the specified letter spacing for table headers and section overlines to differentiate them from interactive content.
- **Weight:** Reserve 700 weight for major headings; use 500 for buttons and navigation items to maintain a refined profile.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid** model. The sidebar remains fixed at `260px`, while the main content area utilizes a 12-column fluid grid with a maximum width of `1440px` to prevent line lengths from becoming unreadable on ultra-wide monitors.

- **Grid:** 12 columns with `24px` gutters for desktop.
- **Margins:** Main page margins are set to `32px` (xl) on desktop and `16px` (md) on mobile.
- **Rhythm:** All spacing must be a multiple of the `4px` base unit. Use `lg (24px)` for padding inside cards and `md (16px)` for spacing between related input elements.
- **Sidebars:** Navigation is docked to the left, utilizing a nested hierarchy for management modules (Members, Billing, Staff, Analytics).

## Elevation & Depth
Depth is created through **Tonal Layering** and **Glassmorphism** rather than traditional drop shadows.

- **Base Layer:** The canvas background `#090B0F` represents the lowest depth.
- **Surface Layer:** Navigation sidebars and top bars use `#111418`.
- **Raised Layer:** Content cards use `#171B21` with a `1px` solid border of `#232833`.
- **Overlays:** Modals and dropdown menus utilize a backdrop-blur (12px) with a semi-transparent hex of the surface color (approx 80% opacity) to create a premium glass effect.
- **Shadows:** When necessary for modals, use a very soft, large-spread black shadow: `0 20px 25px -5px rgba(0, 0, 0, 0.5)`.

## Shapes
The shape language is controlled and balanced, leaning towards a sophisticated "Rounded" aesthetic that softens the technical dark-mode environment.

- **Standard Elements:** Buttons, input fields, and small cards use a `0.5rem (8px)` corner radius.
- **Large Containers:** Main content cards and modals use `rounded-lg (16px)` to clearly define them as distinct architectural pieces.
- **Badges/Chips:** Status indicators use a fully rounded (pill-shaped) profile to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** Background `#5BE584`, Text `#090B0F`, Bold weight. No shadow, subtle scale-down (0.98) on click.
- **Secondary:** Background transparent, Border `#232833`, Text `#F8FAFC`. Hover state: Background `#171B21`.
- **Ghost:** No background/border. Text `#94A3B8`. Hover: Text `#F8FAFC`, Background `#111418`.

### Input Fields
- **Default:** Background `#090B0F`, Border `#232833`, Text `#F8FAFC`.
- **Focus:** Border `#5BE584`, subtle outer glow (ring) using primary color at 20% opacity.
- **Placeholder:** Color `#94A3B8`.

### Cards & Data Tables
- **Cards:** Background `#171B21`, Border `#232833`, Padding `24px`.
- **Tables:** No outer border. Header row uses `label-md` typography with a subtle bottom border. Row hover state: Background `#111418`.

### Chips & Badges
- **Status:** Small, pill-shaped. Low-opacity background of the semantic color (e.g., Success at 10%) with a high-contrast text of the same color.

### Navigation
- **Sidebar Items:** Clear, icon-led labels. Active state: Primary color text with a small `2px` vertical indicator bar on the far left.
- **Top Nav:** Glassmorphic background with `1px` bottom border separating it from the main content.