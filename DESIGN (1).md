---
name: Coastal Unity
colors:
  surface: '#f8f9ff'
  surface-dim: '#c4dcfd'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef4ff'
  surface-container: '#e5efff'
  surface-container-high: '#dbe9ff'
  surface-container-highest: '#d1e4ff'
  on-surface: '#011d35'
  on-surface-variant: '#44474e'
  inverse-surface: '#19324b'
  inverse-on-surface: '#e9f1ff'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#465f88'
  primary: '#002046'
  on-primary: '#ffffff'
  primary-container: '#1b365d'
  on-primary-container: '#87a0cd'
  inverse-primary: '#aec7f7'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#361900'
  on-tertiary: '#ffffff'
  tertiary-container: '#552b00'
  on-tertiary-container: '#eb851c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#aec7f7'
  on-primary-fixed: '#001b3d'
  on-primary-fixed-variant: '#2e476f'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#f8f9ff'
  on-background: '#011d35'
  surface-variant: '#d1e4ff'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
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
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  metric-stat:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
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
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes an institutional yet deeply welcoming visual language for faith-driven student and institutional communities. It balances two complementary modes:
- **Public & Community-Facing Canvas**: Warm, inspirational, communal, and expansive. Emphasizes fellowship, ministry, coastal optimism, leadership, and belonging through rich photography, warm amber accents, open white space, and clear narrative flows.
- **Chapter & Administrative Workspaces**: Structured, dense, accountable, and operationally rigorous. Delivers high-utility administrative oversight, chapter registration ledgers, capitation fee tracking, and rally attendance metrics without visual clutter.

The visual style blends **Corporate Modern** clarity with **Contemporary Soft-SaaS** tactile cues. It uses deep oceanic navies to anchor institutional trust, balanced by solar gold highlights and sea-glass teal accents that reflect coastal fellowship.

## Colors

The palette grounds the interface in maritime authority, warmth, and high-visibility financial clarity.

### Primary, Accent, and Neutrals
- **Primary Navy (`#1B365D`) & Midnight Slate (`#0F2942`)**: Drives global headers, primary action buttons, dark sidebars, and high-contrast title typography.
- **Ocean Teal (`#0D9488` / Tint `#14B8A6`)**: Used for secondary interactions, active navigation states, interactive map markers, and community feature highlights.
- **Warm Gold (`#D97706` / Bright `#F59E0B`)**: Evokes the coastal sun and mission focus. Reserved for rally countdowns, high-priority CTA conversions, and milestone badges.
- **Canvas Neutrals (`#F8FAFC`, `#F1F5F9`, `#E2E8F0`)**: Provides soft, low-glare surface layering for dashboards, metric cards, and responsive table containers.

### Functional Status Tokens
- **Funded / Paid / Success**: Emerald Green (`#059669` base, `#D1FAE5` surface, `#065F46` text). Used for verified payments, confirmed chapter delegations, and on-target goals.
- **Pending / In Review**: Amber (`#D97706` base, `#FEF3C7` surface, `#92400E` text). Highlights pending attendees, unverified receipts, and upcoming rallies.
- **Shortfall / Critical**: Crimson Red (`#DC2626` base, `#FEE2E2` surface, `#991B1B` text). Applied strictly to balance overdues, unsubmitted documents, and capitation discrepancies.

## Typography

The type system pairs **Plus Jakarta Sans** for expressive, warm, geometric display structures with **Inter** for dense, neutral data presentation.

- Use **Plus Jakarta Sans** for hero value propositions, rally campaign headers, modal titles, and KPI numeric metrics. 
- Use **Inter** for chapter portals, member rosters, ledger entries, navigation lists, form schemas, and body copy.
- Numerical financial data (KSh currency, counts, percentages) must leverage tabular figures (`tnum`) inside table cells and summary cards to prevent visual jitter.

## Layout & Spacing

The layout is built on a responsive 12-column grid for public pages and administrative viewports, shifting to a 4-column compact layout for mobile viewports.

- **Public Marketing Layout**: Max-width `1280px` centered container with fluid `margin` (`1rem` on mobile, `2rem` on tablet/desktop). Section gaps leverage `space-xl` multiplied for breathing room between rally cards, program steps, and galleries.
- **Portal & Admin Layout**: Fixed `260px` left sidebar with collapsible drawer on mobile (`< 768px`). The main stage is fluid, utilizing `1.5rem` gutters (`space-lg`) between KPI metric tiles, roster tables, and chart containers.
- **Mobile Adaptations**: Data tables convert to collapsible stacked summary cards below `640px`. Metric blocks shift from 4 across to a 2x2 grid on tablet and 1x1 or 2-column compact strip on mobile screens.

## Elevation & Depth

Visual hierarchy uses clean tonal surfaces bordered by subtle low-contrast lines, supported by soft ambient drop shadows.

- **Level 0 (Flat Canvas)**: `#F8FAFC` background without shadow.
- **Level 1 (Cards, Metric Containers, Public Panels)**: White (`#FFFFFF`) surface with a 1px border (`#E2E8F0`) and an ambient shadow: `0 1px 3px rgba(15, 41, 66, 0.05), 0 1px 2px rgba(15, 41, 66, 0.03)`.
- **Level 2 (Dropdowns, Interactive Card Hover, Mobile Nav Bar)**: White (`#FFFFFF`) surface with border (`#CBD5E1`) and depth shadow: `0 4px 12px rgba(15, 41, 66, 0.08), 0 2px 4px rgba(15, 41, 66, 0.04)`.
- **Level 3 (Modals, Rally Registration Overlays, Toasts)**: `#FFFFFF` with high-diffusion shadow: `0 20px 25px -5px rgba(15, 41, 66, 0.12), 0 10px 10px -5px rgba(15, 41, 66, 0.06)`.
- **Dark Elements (Sidebar & Hero Banner)**: Deep `#0F2942` solid background. Inner elements leverage semi-transparent white overlays (`rgba(255, 255, 255, 0.06)`) for active tabs and button states rather than shadows.

## Shapes

A balanced `roundedness: 2` (base `8px / 0.5rem`) creates an approachable, contemporary feel without compromising data density.

- **Inputs, Buttons, and Select Menus**: `8px` (`0.5rem`) corner radius.
- **Content Cards, Modal Windows, and Data Containers**: `12px` to `16px` (`0.75rem` to `1rem`).
- **Pill Badges and Status Chips**: Fully rounded (`9999px`) for quick visual scanning of payment status and chapter verification.
- **Hero Image Wrappers & Interactive Teasers**: `16px` to `24px` with smooth overflow clipping.

## Components

### Buttons
- **Primary**: Solid Navy (`#1B365D`) text white, transitioning to `#0F2942` on hover. Padding: `10px 20px` (Desktop), `12px 20px` (Mobile touch target).
- **Accent (Call-to-Action / Register)**: Solid Warm Gold (`#D97706`) with white bold text, transitioning to `#B45309`. Used for primary rally action triggers.
- **Secondary / Outline**: Clean 1px border (`#CBD5E1`), background white, text `#1B365D`. Hover brings `#F1F5F9`.
- **Ghost / Link**: Unbordered, transparent background, text `#0D9488` with hover underline or pill tint.

### Status Chips & Badges
- Compact height (`24px`), horizontal padding (`10px`), font `label-sm` uppercase/semi-bold.
- **Confirmed / Paid**: Background `#ECFDF5`, text `#065F46`, border 1px `#A7F3D0`.
- **Pending**: Background `#FFFBEB`, text `#92400E`, border 1px `#FDE68A`.
- **Overdue**: Background `#FEF2F2`, text `#991B1B`, border 1px `#FECACA`.

### Cards & KPI Tiles
- Metric tiles present an icon container with a soft colored circle (`#F1F5F9` or teal/amber tint), an `Inter` 12px muted gray label, a bold `Plus Jakarta Sans` 28px metric, and a baseline progress/trend indicator below.
- Dashboard cards share uniform white backgrounds with `1px solid #E2E8F0` border and `space-md` inner padding.

### Form Inputs & Selects
- Inputs feature a 1px border (`#CBD5E1`), placeholder `#94A3B8`, and focus ring of `2px #0D9488` with soft teal shadow.
- Field labels sit above in `Inter` 13px weight 600 (`#1B365D`), accompanied by concise helper or validation text.

### Rally Countdown Banner
- Public hero or card component utilizing high-contrast typography, containing segment blocks for days, hours, minutes, and seconds rendered in bold sans-serif with subtle background fills (`#F1F5F9`).

### Data Tables
- Header cells: `#F8FAFC` background, 12px uppercase semi-bold text (`#64748B`), 1px border bottom (`#E2E8F0`).
- Row height: `52px` default desktop; alternates hover fill to `#F8FAFC`. Responsive breakpoint transforms row cells to a multi-line card pattern on screens `< 640px`.