---
name: Apex Athletic OS
colors:
  surface: '#111318'
  surface-dim: '#111318'
  surface-bright: '#37393e'
  surface-container-lowest: '#0c0e12'
  surface-container-low: '#1a1c20'
  surface-container: '#1e2024'
  surface-container-high: '#282a2e'
  surface-container-highest: '#333539'
  on-surface: '#e2e2e8'
  on-surface-variant: '#bccaba'
  inverse-surface: '#e2e2e8'
  inverse-on-surface: '#2f3035'
  outline: '#869486'
  outline-variant: '#3d4a3e'
  surface-tint: '#55e07f'
  primary: '#90ffa8'
  on-primary: '#003917'
  primary-container: '#5be584'
  on-primary-container: '#00642d'
  inverse-primary: '#006d32'
  secondary: '#56e07c'
  on-secondary: '#003916'
  secondary-container: '#00aa4e'
  on-secondary-container: '#003413'
  tertiary: '#e3e7f2'
  on-tertiary: '#2c3139'
  tertiary-container: '#c7cbd6'
  on-tertiary-container: '#51565f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#74fd99'
  primary-fixed-dim: '#55e07f'
  on-primary-fixed: '#00210b'
  on-primary-fixed-variant: '#005224'
  secondary-fixed: '#75fd96'
  secondary-fixed-dim: '#56e07c'
  on-secondary-fixed: '#00210a'
  on-secondary-fixed-variant: '#005322'
  tertiary-fixed: '#dee2ee'
  tertiary-fixed-dim: '#c2c6d1'
  on-tertiary-fixed: '#171c24'
  on-tertiary-fixed-variant: '#424750'
  background: '#111318'
  on-background: '#e2e2e8'
  surface-variant: '#333539'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 44px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.005em
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.06em
  metric-display:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system establishes a high-performance, dark-mode SaaS operating system engineered for premium fitness clubs, boutique studios, and enterprise gym chains. The interface channels precision, operational velocity, and discipline—balancing elite athletics with executive SaaS rigor.

The aesthetic fuses **Minimalism** and **Tactile Glassmorphic Tiers**:
- Ultra-deep obsidian bases that eliminate visual strain across high-frequency daily operations.
- High-contrast neon-emerald accents (`#5BE584`) signaling vitality, active status, and financial growth.
- Subtle inner luminescence, structural ghost strokes, and precise typographic hierarchy.
- Reassuring, institutional tactile controls that evoke advanced gym hardware, connected biometric displays, and luxury fitness hospitality.

## Colors

The palette operates on a strict functional luminance hierarchy designed for dark-mode environments:

### Core Tokens
- **Canvas Base (`#090B0F`)**: Deepest substrate; used exclusively for window backgrounds, page canvas, and navigation rail underlays.
- **Surface Layer 1 (`#13171D`)**: Primary elevation for modular cards, table views, and top utility bars.
- **Surface Layer 2 (`#1B2028`)**: Secondary elevation for nested panels, table headers, hover surfaces, inputs, and modal wrappers.
- **Primary Kinetic (`#5BE584`)**: High-visibility athletic emerald for key performance indicators, active session toggles, primary conversion actions, and live check-in statuses.
- **Hover Kinetic (`#49D472`)**: Pressed/hover state for primary actions and focused interactive indicators.
- **Border / Ghost Stroke (`#222834` / `rgba(255, 255, 255, 0.08)`)**: Structural delimiter delivering razor-sharp boundaries without heavy visual weight.

### Typography Tokens
- **Text Primary (`#F8FAFC`)**: High-contrast, crisp white for metric readouts, headlines, and data table values.
- **Text Secondary (`#94A3B8`)**: Cool slate for metadata, column headers, input placeholders, and inactive member statuses.
- **Text Inverse (`#090B0F`)**: Deep pitch black for text rendered on top of Primary Kinetic elements.

### Accent & Status Overlays
- **Primary Glow**: `rgba(91, 229, 132, 0.15)` for ambient backlights and live status focus rings.
- **Surface Border Highlight**: Top-edge linear gradient (`rgba(255, 255, 255, 0.12)` fading to `rgba(255, 255, 255, 0.02)`) providing a machined rim-light effect.

## Typography

Typographic discipline in this design system leverages **Inter** across all roles to achieve technical neutrality and maximum scan-ability.

- **Numerics & Data Tables**: Always render metrics, currency, capacities, and countdown timers using tabular figures (`font-variant-numeric: tabular-nums;`).
- **Metric Displays**: Large format KPIs (e.g., Active Members, Monthly Recurring Revenue, Class Capacity) use `metric-display` with tight tracking (`-0.03em`) for immediate visual anchor.
- **Labels & Micro-Badges**: Small labels (`label-sm`) default to uppercase tracking (`text-transform: uppercase; letter-spacing: 0.06em;`) to establish distinction between data metadata and live values.
- **Hierarchy Enforcement**: Primary headers use semi-bold (`600`) and bold (`700`) weights; descriptive copy is constrained to regular (`400`) in secondary slate (`#94A3B8`) to maintain clear contrast ratios.

## Layout & Spacing

The system enforces an **8-point spatial cadence** aligned to a strict fluid column grid with controlled outer constraints.

### Screen Layout Strategy
- **Desktop (1280px+)**: 12-column grid, dynamic gutter (`gutter: 1.5rem`), fixed outer padding (`margin: 2rem`), max-width container capped at `1600px` for ultra-wide gym reception dashboards.
- **Tablet (768px - 1279px)**: 8-column layout with 240px collapsable left navigation rail; standard 1.5rem gutters.
- **Mobile (<768px)**: 4-column layout with pinned bottom navigation bar, tight canvas margins (`margin-mobile: 1rem`), and compact gutters (`gutter-mobile: 1rem`).

### Component Spacing Disciplines
- Use `space-xs` (4px) and `space-sm` (8px) for internal pill padding, metric tag clusters, and badge padding.
- Use `space-md` (16px) for form control interiors, standard card padding, and button hit-areas.
- Use `space-lg` (24px) for analytical card padding and header-to-content separators.
- Use `space-xl` (32px) and `space-2xl` (48px) strictly for section separation and layout dashboard modules.

## Elevation & Depth

Visual hierarchy is maintained through structured **Tonal Stacking** paired with **Machined Ghost Borders** and **Emerald Luminescence**, strictly avoiding muddy, uncontrolled drop-shadows.

### Layer Stacking Paradigm
1. **Base Layer (`#090B0F`)**: Canvas bedrock. Contains zero shadow.
2. **Elevated Cards (`#13171D`)**: Standard dashboard modules. Uses a solid perimeter border of `1px solid rgba(255, 255, 255, 0.08)`.
3. **Floating Overlays & Flyouts (`#1B2028`)**: Modals, quick-booking drawers, and dropdown menus. Elevated via `box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7)`.

### Precision Edge Highlighting
Every elevated container implements a layered top edge rim:
- `box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.08);`
This creates the optical illusion of physical overhead light catching the beveled edge of high-end gym console hardware.

### Atmospheric Glow
Interactive or live elements utilize targeted kinetic halos:
- **Active State Glow**: `0 0 24px -4px rgba(91, 229, 132, 0.35)`
- **Check-in Beacon**: Pulsing keyframe effect radiating a 12px blur halo using `rgba(91, 229, 132, 0.2)`.

## Shapes

The design system standardizes on an assertive, modern rounded silhouette tailored to SaaS interfaces with dense data sets:

- **Primary Cards & Containers (`rounded-2xl` / 1.5rem)**: Used for KPI widgets, calendar overviews, membership tiers, and check-in rosters.
- **Panels, Secondary Blocks & Tables (`rounded-xl` / 1.0rem)**: Used for data tables, nested card elements, filter groups, and class schedule slots.
- **Controls & Form Elements (`rounded-lg` / 0.5rem - 0.75rem)**: Standardized for text inputs, select buttons, and interactive triggers.
- **Pills & Status Rings (`rounded-full` / 9999px)**: Reserved for status indicators (Active, Expiring, Past Due), member avatar frames, and category chips.

## Components

### Buttons
- **Primary**: Background `#5BE584`, Text `#090B0F` (Inter Semi-Bold). Hover state: `#49D472` with subtle outer glow `0 0 16px rgba(91, 229, 132, 0.4)`. Border radius: `rounded-xl`. Active state transforms slightly (`scale(0.98)`).
- **Secondary / Surface**: Background `#1B2028`, Text `#F8FAFC`, Border `1px solid rgba(255, 255, 255, 0.08)`. Hover: Border `rgba(255, 255, 255, 0.16)`, background `rgba(27, 32, 40, 0.8)`.
- **Ghost / Destructive**: Background transparent, Text `#94A3B8`. Hover: Text `#F8FAFC`, background `rgba(255, 255, 255, 0.04)`. Destructive variants employ crimson tint (`#EF4444`).

### Cards & Analytical Containers
- Built on Surface 1 (`#13171D`) with `rounded-2xl` geometry and `1px solid rgba(255, 255, 255, 0.08)` border.
- Integrated top highlight (`inset 0 1px 0 0 rgba(255, 255, 255, 0.06)`).
- Card headers feature clear separation with small uppercase category tags (`label-sm`), large tabular metrics, and positive/negative trend indicators.

### Inputs & Select Fields
- Background `#13171D`, elevated on focus to `#1B2028`.
- Height: 44px for high-throughput touch or desktop operation.
- Border: `1px solid rgba(255, 255, 255, 0.08)`.
- Focus state: Border transitions to `#5BE584` accompanied by an emerald focus ring (`box-shadow: 0 0 0 3px rgba(91, 229, 132, 0.15)`).
- Placeholder text rendered in `#94A3B8`.

### Checkboxes & Radios
- Size: 20px x 20px, rounded corners (`rounded-md` for checkboxes, `rounded-full` for radios).
- Inactive: Background `#1B2028`, Border `1px solid rgba(255, 255, 255, 0.12)`.
- Active: Background `#5BE584`, Check/Dot icon in pitch `#090B0F`.

### Chips & Badges
- Dynamic status indicators utilize pill geometry (`rounded-full`).
- **Active Member Badge**: Background `rgba(91, 229, 132, 0.1)`, Text `#5BE584`, Border `1px solid rgba(91, 229, 132, 0.2)`. Accompanied by a 6px solid `#5BE584` indicator dot.
- **Alert / Overdue Badge**: Background `rgba(239, 68, 68, 0.1)`, Text `#EF4444`, Border `1px solid rgba(239, 68, 68, 0.2)`.

### Specialized Gym Platform Components
- **Turnstile / Check-in Feed**: Real-time ticker cards featuring high-contrast member headshots, membership tier tag, digital waiver verification icon, and access timestamps.
- **Class Capacity Progress Bar**: Custom track with background `#1B2028`, height 6px, `rounded-full`. Fill bar in `#5BE584` smoothly transitions to warning amber at 85% capacity and red at 100%.
- **Trainer Shift & Booking Blocks**: Timetable cells on `#13171D` with a 3px left border accent in `#5BE584` indicating assigned sessions, complete with participant counter chips.