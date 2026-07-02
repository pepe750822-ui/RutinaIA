---
name: RutinaIA Core
colors:
  surface: '#0e1322'
  surface-dim: '#0e1322'
  surface-bright: '#343949'
  surface-container-lowest: '#090e1c'
  surface-container-low: '#161b2b'
  surface-container: '#1a1f2f'
  surface-container-high: '#25293a'
  surface-container-highest: '#2f3445'
  on-surface: '#dee1f7'
  on-surface-variant: '#b9cbb9'
  inverse-surface: '#dee1f7'
  inverse-on-surface: '#2b3040'
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
  tertiary: '#fff9ff'
  on-tertiary: '#3c0090'
  tertiary-container: '#e6d8ff'
  on-tertiary-container: '#7521ff'
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
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d1bcff'
  on-tertiary-fixed: '#23005b'
  on-tertiary-fixed-variant: '#5700c9'
  background: '#0e1322'
  on-background: '#dee1f7'
  surface-variant: '#2f3445'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 52px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
  data-metric:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-margin: 20px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  section-gap: 48px
---

## Brand & Style

The design system is engineered for a high-performance, AI-driven fitness ecosystem. The brand personality is aggressive, futuristic, and motivating—positioning the user as a "cybernetic athlete" within a data-rich environment. 

The aesthetic leverages **Glassmorphism** and **Futuristic Minimalism**. The interface prioritizes deep spatial depth through stacked semi-transparent layers, punctuated by high-frequency neon accents that simulate energy and movement. Visual interest is maintained through technical textures, such as micro-dot grids and perimeter glows, ensuring the UI feels like a high-end heads-up display (HUD).

## Colors

The palette is anchored in a deep-space navy (#0a0f1e) to provide maximum contrast for neon elements. 

- **Primary Accent (Neon Green):** Reserved for "Active" states, completion, and growth metrics. It should always carry a subtle outer glow.
- **Secondary Accent (Bright Blue):** Used for navigation, information callouts, and data visualization.
- **Surface Colors:** Surfaces are not solid; they utilize semi-transparent white with a high `backdrop-filter: blur(20px)`.
- **Gradients:** Use linear gradients from Secondary Blue to Primary Green (at 135 degrees) for high-impact cards or "Start Workout" calls-to-action.

## Typography

This design system uses a triple-font approach to balance impact with readability:
1. **Montserrat** is the voice of the brand, used for bold, authoritative headlines.
2. **Be Vietnam Pro** handles body copy and instructional text, providing a contemporary and friendly feel that eases the intensity of the dark UI.
3. **Space Grotesk** is used for technical labels and numerical data, leaning into the "futuristic HUD" aesthetic.

For display text, utilize `text-shadow: 0 0 10px rgba(0, 255, 136, 0.3)` on primary-colored headings to enhance the neon effect.

## Layout & Spacing

The layout is **Mobile-First**, optimized for a 375px viewport width. 

- **Grid:** Use a 4-column fluid grid for mobile.
- **Margins:** A standard 20px horizontal margin ensures content doesn't hit the screen edges.
- **Rhythm:** Spacing follows an 8px incremental scale. 
- **Containment:** Use cards with internal padding of 20px to group workout data.
- **Background Texture:** A subtle dot-grid pattern (1px dots, 24px apart) should be fixed to the background to provide a sense of scale and technical precision.

## Elevation & Depth

Depth is achieved through "Glass Tiers" rather than traditional shadows:

1. **Level 0 (Background):** #0a0f1e with a subtle radial gradient of #0066ff at 10% opacity in the bottom right corner.
2. **Level 1 (Cards/Containers):** `rgba(255, 255, 255, 0.04)` background with `backdrop-filter: blur(20px)` and a 1px border of `rgba(255, 255, 255, 0.1)`.
3. **Level 2 (Active Elements):** Same as Level 1, but with a `box-shadow: 0 0 20px rgba(0, 255, 136, 0.15)` and a primary-colored border.
4. **Level 3 (Modals/Overlays):** `rgba(10, 15, 30, 0.8)` background with a 1px top-border of white at 20% opacity to simulate light hitting the edge.

## Shapes

The design system utilizes exaggerated rounded corners to soften the aggressive technical aesthetic.
- **Standard Cards:** `rounded-2xl` (1.5rem / 24px).
- **Buttons & Inputs:** `rounded-xl` (1rem / 16px).
- **Small Components (Chips/Badges):** Fully rounded (Pill).
- **Interactive States:** On press, elements should slightly scale down (98%) to provide tactile feedback.

## Components

- **Primary Button:** High-contrast Neon Green (#00ff88) background with black text. Apply a `box-shadow: 0 4px 15px rgba(0, 255, 136, 0.4)`.
- **Glass Card:** Semi-transparent layer with a 1px stroke. The stroke should be a linear gradient from top-left (white @ 20%) to bottom-right (white @ 5%).
- **Metric Chips:** Small pill-shaped containers with a "Secondary Blue" soft glow. Use Space Grotesk for the values.
- **Progress Rings:** Use thin, neon-green strokes for AI-calculated progress. Background paths of the rings should be deep navy with 20% opacity.
- **Input Fields:** Darker than the background (#050810) with a `rounded-xl` border that glows Neon Green when focused.
- **AI Feedback Glow:** A soft, breathing radial gradient (Primary Green) that appears behind text or components when the AI is "calculating" or providing a suggestion.