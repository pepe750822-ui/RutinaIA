---
name: RutinaIA
colors:
  surface: '#0c160e'
  surface-dim: '#0c160e'
  surface-bright: '#323c32'
  surface-container-lowest: '#071009'
  surface-container-low: '#141e16'
  surface-container: '#18221a'
  surface-container-high: '#222c24'
  surface-container-highest: '#2d372e'
  on-surface: '#dae6d8'
  on-surface-variant: '#b9cbb9'
  inverse-surface: '#dae6d8'
  inverse-on-surface: '#29332a'
  outline: '#849585'
  outline-variant: '#3b4b3d'
  surface-tint: '#00e479'
  primary: '#f1ffef'
  on-primary: '#003919'
  primary-container: '#00ff88'
  on-primary-container: '#007139'
  inverse-primary: '#006d37'
  secondary: '#b3c5ff'
  on-secondary: '#002b75'
  secondary-container: '#0266ff'
  on-secondary-container: '#f9f7ff'
  tertiary: '#fffaf7'
  on-tertiary: '#3d2f00'
  tertiary-container: '#ffdb79'
  on-tertiary-container: '#795f01'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#60ff99'
  primary-fixed-dim: '#00e479'
  on-primary-fixed: '#00210c'
  on-primary-fixed-variant: '#005228'
  secondary-fixed: '#dae1ff'
  secondary-fixed-dim: '#b3c5ff'
  on-secondary-fixed: '#001849'
  on-secondary-fixed-variant: '#003fa4'
  tertiary-fixed: '#ffe08d'
  tertiary-fixed-dim: '#e5c364'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#584400'
  background: '#0c160e'
  on-background: '#dae6d8'
  surface-variant: '#2d372e'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Montserrat
    fontSize: 36px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
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
  sm: 16px
  md: 24px
  lg: 32px
  xl: 48px
  container-margin: 20px
  gutter: 16px
---

## Brand & Style

The design system is engineered for a high-energy, AI-driven fitness environment. It targets performance-oriented users who value precision, motivation, and a futuristic aesthetic. The brand personality is "The Digital Athlete"—disciplined, advanced, and energetic.

The visual style leverages **Glassmorphism** and **High-Contrast Neon** accents. By utilizing deep navy surfaces with semi-transparent overlays and vibrant glows, the interface evokes a state-of-the-art laboratory or a night-time urban training session. The emotional response is one of focus and technological empowerment, where data feels alive and progress feels tangible.

## Colors

The palette is anchored in a deep, nocturnal navy to provide maximum contrast for the neon accent colors. 

- **Primary (#00ff88):** "Neon Green" is used exclusively for action, progress, and success states. It represents vitality and movement.
- **Secondary (#0066ff):** "Bright Blue" serves as a technical counterpart, used for informational highlights, data points, and secondary interactive elements.
- **Surface Strategy:** Backgrounds utilize the deep navy base. Glassmorphic cards use a white-tinted transparency (`rgba(255, 255, 255, 0.05)`) to create depth without sacrificing legibility.
- **Glow Effects:** Critical CTA elements utilize a box-shadow with the primary color at 40-60% opacity to simulate a light-emitting "neon" source.

## Typography

This design system uses a dual-font strategy. **Montserrat** is used for headlines and display text to provide a bold, geometric, and aggressive athletic feel. **Inter** is used for body text and labels to ensure maximum readability for technical stats and instructional content.

Large display headings use a tighter letter-spacing and heavy weights to command attention. Labels and small metadata components use increased letter-spacing and uppercase styling to maintain a structured, technical look.

## Layout & Spacing

The layout follows a 12-column fluid grid for desktop and a 4-column fluid grid for mobile. A 4px baseline shift is used to maintain vertical rhythm. 

- **Padding:** Internal card padding should be a minimum of `24px` (md) to allow the glassmorphic background to "breathe."
- **Margins:** Sections should be separated by `48px` (xl) to maintain the minimalist, airy feel of the brand.
- **Safe Areas:** On mobile, a standard `20px` horizontal margin is enforced to prevent content from hitting the screen edges.

## Elevation & Depth

Hierarchy is established through **Backdrop Filtering** and **Tonal Layering**. 

1. **Level 0 (Background):** Solid #0a0f1e.
2. **Level 1 (Cards/Surfaces):** `backdrop-filter: blur(12px)` with a `1px` stroke using `rgba(255, 255, 255, 0.1)`. This creates a frosted glass effect that lifts the element off the navy background.
3. **Level 2 (Overlays/Modals):** Darker glass `rgba(0, 0, 0, 0.4)` with a heavier blur (20px) to focus the user's attention.
4. **Active States:** Important elements use an outer glow (`box-shadow: 0 0 15px rgba(0, 255, 136, 0.4)`) rather than traditional black shadows to emphasize the neon theme.

## Shapes

The design system utilizes a **Rounded** (Level 2) shape language to balance the aggressive neon colors with a modern, approachable feel.

- **Standard Elements:** Buttons, input fields, and small widgets use a `0.5rem` (8px) radius.
- **Containers:** Progress cards, stat modules, and workout summaries use `rounded-xl` (1.5rem / 24px) to create a distinct, modular look.
- **Interactive Indicators:** Status pills and selection chips are fully rounded (pill-shaped).

## Components

- **Buttons:** 
  - *Primary:* Solid Neon Green (#00ff88) background with black text. High-glow shadow on hover/active states. 
  - *Secondary:* Ghost style with a 2px Neon Green border and blur background.
- **Cards:** Use the glassmorphic specification. Content should be padded with 24px. Headers within cards should use Montserrat Medium.
- **Progress Bars:** Backgrounds are a dark navy tint; the active fill is a gradient from Blue (#0066ff) to Neon Green (#00ff88) to show momentum.
- **Stats Cards:** Large display typography for the primary metric. Use Lucide icons in the top right corner with a subtle blue tint.
- **Input Fields:** Semi-transparent background with a 1px border. On focus, the border transitions to Neon Green with a subtle glow.
- **Chips/Badges:** Small, high-contrast pills used for workout tags (e.g., "Strength," "AI-Generated").