# Orionex Unified Web Brand & Design System

This comprehensive document outlines the design system, typography, color palette, UI/UX patterns, and development guidelines used across the entire Orionex ecosystem—spanning from the public-facing landing pages to the internal web application. Adhere to these guidelines to maintain a premium, cohesive, and modern corporate SaaS aesthetic.

## 1. Core Philosophy & Aesthetic
- **Brand Identity:** Ultra-premium, B2B SaaS, Modern Corporate IT, and Enterprise AI.
- **Visual Language:** The interface leverages a futuristic yet highly professional design language characterized by **Glassmorphism**, dynamic ambient lighting (glows, orbs, and blurs), and precise typographic hierarchy.
- **Interactivity & Feel:** The application feels lightweight, responsive, and dynamic. Elements must feel "alive" through extensive micro-interactions, custom cursors, hover effects, and exceptionally smooth transitions, preventing the interface from ever feeling static.

---

## 2. Color System

### Primary Brand Colors
- **Orion Blue (`#0030FF`)**: The core brand color. Used for prominent active states, primary buttons, gradients, glowing effects, and brand highlighting.
- **Orion Yellow (`#FFCF00`)**: The secondary brand accent. Used sparingly for high-contrast highlights, warnings, or gradient transitions (especially effective against dark backgrounds).
- **Orion Dark (`#0a0a2a`)**: A deep, saturated navy blue used as the primary background canvas for Dark Mode, creating depth for glowing elements.

### Neutral Colors (Slate Scale)
The application relies heavily on the Tailwind `slate` palette for structure, text, and borders to maintain a cool, professional tone.
- **Backgrounds (Light Mode)**: `white`, `slate-50`, `slate-100`
- **Backgrounds (Dark Mode)**: `slate-900`, `slate-950`, `#020617`, and `Orion Dark`
- **Borders & Dividers**: `slate-200`, `slate-300` (Light) / `white/5`, `white/10` (Dark)
- **Text (Light Mode)**: `slate-900` (Headings), `slate-500` to `slate-700` (Body text)
- **Text (Dark Mode)**: `slate-50`, `white` (Headings), `slate-300` to `slate-400` (Body text)

### Semantic Colors (Application UI)
- **Success (Emerald)**: `emerald-500` / `emerald-600` (e.g., Analysis Complete, Validations)
- **Warning (Amber)**: `amber-500` (e.g., Bounding boxes, Alerts)
- **Error (Red)**: `red-500` / `red-600` (e.g., Failed processes, Deletions)

### Gradients
Gradients are used strategically to create depth and focus:
- **Shimmer Gradient**: `bg-gradient-to-r from-orionBlue via-orionYellow to-orionBlue` (Animated on text).
- **Premium Gradient**: `bg-gradient-to-r from-orionBlue via-blue-500 to-orionYellow`.
- **Card Spotlights**: Subtle diagonal gradients inside cards (e.g., `from-blue-500/5 via-transparent to-orionBlue/5`).

---

## 3. Typography
The system uses two distinct Google Font families to clearly separate structural/display data from readable body text.

### Headings & Display: **Montserrat** (`font-display`)
- **Characteristics:** Geometric, strong presence.
- **Weights:** Regular (400), Medium (500), SemiBold (600), Bold (700), ExtraBold (800).
- **Usage:** Used for all `h1` through `h6` tags, prominent titles, app headers, impactful marketing text, and critical UI tabs.

### Body & UI Sans: **Inter** (`font-sans`)
- **Characteristics:** Clean, highly readable, neutral.
- **Weights:** Light (300), Regular (400), Medium (500), SemiBold (600), Bold (700).
- **Usage:** Standard body text, input fields, paragraphs (`.markdown-body`), descriptions, and secondary button labels.

---

## 4. Visual Effects & Layers

### Glassmorphism Architecture
The design relies heavily on varying levels of frosted glass effects defined in the global stylesheet:
- **`.glass-panel`**: Base glass effect (`bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-slate-200/60 dark:border-white/10 shadow-xl`).
- **`.glass-card`**: Similar to the panel, but adds interactive hover states (`hover:-translate-y-1 hover:shadow-orionBlue/10 hover:border-orionBlue/30`).
- **`.glass-morphism-ultra`**: Used for hero sections, modals, or featured content blocks. Features deep blurs and radiuses (`bg-white/70 dark:bg-slate-900/50 backdrop-blur-3xl shadow-2xl rounded-3xl`).

### Ambient Backgrounds & Textures
Instead of flat backgrounds, sections and app views feature:
- **Ambient Orbs & Glows**: Large, heavily blurred colored shapes (`w-[50vw] h-[50vw] bg-orionBlue/20 blur-[100px] to blur-[120px]`) placed strategically behind the interface. 
- **Blend Modes:** Orbs use `mix-blend-multiply` in light mode and `mix-blend-screen` in dark mode.
- **Noise Overlays**: A subtle SVG fractal noise texture (`mix-blend-overlay` at `1.5%` to `3%` opacity) is applied globally to prevent banding on gradients and provide a tactile, premium feel to the digital space.

---

## 5. Component Design System

### Buttons & Controls
- **Primary Buttons**: Round corners (`rounded-xl` or `rounded-lg`), solid fill (`bg-orionBlue`), stark white text, accompanied by an intense colored drop shadow (`shadow-[0_0_20px_rgba(0,48,255,0.3)]`).
- **Secondary/Icon Buttons**: Ghost-like appearance (`bg-slate-200/50 dark:bg-white/5`), minimal text color change on hover. Used for utility actions (Toggle Theme, Close, Pagination).
- **Navigation Tabs**: Use active states characterized by tinted backgrounds (`bg-orionBlue/10`), explicit borders (`border-orionBlue/30`), and subtle glowing shadows (`shadow-[0_0_15px_rgba(0,48,255,0.05)]`).

### Layouts, Cards & Tags
- **Border Radius**: Heavy use of large, friendly radiuses to counteract technical complexity (`rounded-2xl` or `rounded-3xl` for main containers; `rounded-xl` for inner cards).
- **Drag & Drop Zones**: Characterized by thick dashed borders (`border-2 border-dashed border-slate-300 dark:border-white/10`). Active drop states switch to solid/glowing Orion Blue edges with tinted backgrounds.
- **Pill Tags**: Small contextual tags use rounded pills with frosted backgrounds (`bg-white/50 dark:bg-orionBlue/10`), uppercase tracking (`tracking-widest`), and brand-colored borders.

### Forms & Inputs
- **Base Style**: `bg-white dark:bg-slate-900` with 1px solid structural borders.
- **Focus Rings**: Remove standard browser outlines in favor of tight, branded ring accents (`focus:border-orionBlue focus:ring-1 focus:ring-orionBlue`).
- **Code/Data Typography**: Context-dependent (e.g., Schema editors use monospaced text for JSON keys).

---

## 6. Animations & Interactivity

The system uses Framer Motion for scroll-based layouts and complex orchestration, combined with Tailwind CSS keyframes for infinite states and micro-interactions.

### Global Transitions & Timings
- **Theme Switching**: A slow, luxurious `duration-700 transition-colors` is applied to `body`, `main`, and sidebars so light/dark mode switches smoothly without jarring flashes.
- **Standard UI Transitions**: Use `duration-300` for snappy responses on buttons and general hovers.

### Custom Keyframes & Infinite Animations
- **`text-shimmer`**: A horizontal background sweep over the *Shimmer Gradient*, creating a metallic or loading highlight effect.
- **`float`**: A continuous 6-second vertical translation (`translateY(-20px)`) applied to ambient background orbs, abstract illustrations, or tech stack icons.
- **`pulse-glow`**: Opacity and shadow shifting (`box-shadow: 0 0 40px rgba(0, 48, 255, 0.8)`) used for scanning activity icons and prominent CTAs.
- **`fade-in-up` / `fade-in-down`**: For smooth, scroll-triggered section entrances.
- **`border-glow-flowing`**: Animated continuous borders applied via pseudo-elements to draw attention to "Enterprise" cards or active dropzones.

### Micro-interactions (Hover States)
- Cards utilize significant hover transformations (`hover:-translate-y-1` or `-translate-y-2`) alongside shadow increases to invite interaction.
- Internal card elements (icons, large decorative numbers) react to parent hovers (e.g., `group-hover:scale-110`) to make the entire card feel connected.

---

## 7. Layout & Spacing
- **Container Widths:** Centralized marketing content uses `container mx-auto px-6 md:px-12`. App content is heavily fluid.
- **Vertical Rhythm:** Generous vertical spacing (e.g., `py-24 lg:py-32` on landing pages) to separate major logical sections and allow ambient backgrounds to breathe.
- **Grid Systems:** Standard Tailwind grid deployments matching content density (typically 3-column structures for feature arrays).
- **Custom Scrollbars:** Sleek scrollbars defined globally with smooth rounded thumbs that match the active theme's slate colors.

---

## 8. Dark Mode Strategy
The entire application and landing ecosystem must be completely responsive to Dark Mode (using `dark:` Tailwind variants), controlled deeply via system preferences and explicit toggles.
- **Background Shift**: Transitions from stark whites and light slates to the deeply tinted `--color-orionDark` (`#0a0a2a`) and cool `slate-900` variations.
- **Border Shift**: Moves from opaque grays (`border-slate-200`) to low-opacity whites (`border-white/5` to `border-white/10`) to create boundaries without adding unwanted luminance.
- **Blend Mode Shift**: Ambient glows (Blue and Yellow) automatically switch from `mix-blend-multiply` in Light Mode to `mix-blend-screen` in Dark Mode to ensure they always contrast beautifully against the background.

---

## 9. Logo & Iconography
- **Base Brand Asset**: `https://storage.orionex.id/orionex-storage/orionex_tiny_white.png`
- **Favicon**: Use the same base asset file as the site's favicon.
- **Theme Adaptation for Logo**: The base logo file is natively white (perfect for dark themes). For light themes, apply a CSS invert filter (e.g., using Tailwind's `invert` class) to instantly convert it to black. Do not load a separate image asset.
- **Icon Library**: `lucide-react`
- **Icon Styling**: Icons are typically housed inside rounded square containers (`w-16 h-16 rounded-2xl`) layered with backdrop filters (`backdrop-blur-md`). In hover states, icons frequently invert colors (e.g., the background shifts to the primary brand color, and the icon strokes shift to white).

---

## 10. UX & Performance Optimization
- **Progressive Loading**: Below-the-fold content deeply utilizes React `Suspense` boundaries combined with bespoke skeletal `SectionLoader` pulses. This ensures heavy interactive components or 3D elements don't block the initial paint.
- **Accessibility**: Contrast ratios are strictly maintained within glass panels using inner ring strokes and explicit text contrast pairings.
- **Custom Cursors**: For a highly immersive branding feel on landing pages, interactive elements sometimes utilize `cursor-none-interactive`, surrendering cursor control to a custom tracked DOM element (`CursorFollower`).

---
*If you have any specific implementation questions or need code snippets for exact React/Tailwind setups for any of these patterns, please let me know!*