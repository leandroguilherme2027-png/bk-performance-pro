# Design Brief

## Direction

BK PERFORMANCE PRO — dark-first gamer telemetry console: near-black surfaces, electric-blue action language, and monospace numeric readouts that make device stats feel like live instrumentation.

## Tone

High-contrast modern gaming tech — confident, precise, and performance-obsessed, never neon-cheap or toy-like.

## Differentiation

Every metric renders as a telemetry card: a hairline electric-blue rule, an uppercase micro-label, and a large tabular-figure value — a cockpit readout, not a generic dashboard.

## Color Palette

| Token      | OKLCH        | Role                                    |
| ---------- | ------------ | --------------------------------------- |
| background | 0.145 0.018 258 | Deep cool near-black app canvas      |
| foreground | 0.97 0.005 250  | Crisp white text, AA+ on background  |
| card       | 0.19 0.022 258  | Elevated telemetry / content surfaces|
| primary    | 0.66 0.19 252   | Electric blue — primary actions, ring|
| accent     | 0.78 0.14 205   | Plasma cyan — data highlights, active|
| muted      | 0.24 0.024 258  | Inactive fills, secondary labels     |
| destructive| 0.6 0.21 22     | Errors and destructive confirmation  |
| success    | 0.72 0.17 152   | Healthy device state                 |
| warning    | 0.78 0.15 78    | Heating / attention alerts           |

## Typography

- Display: Space Grotesk — app wordmark, section headings, button labels (geometric, techy, tracking-tight).
- Body: DM Sans — paragraphs, descriptions, form fields; highly legible on low-DPI entry-level screens.
- Mono: JetBrains Mono — FPS / RAM / temperature values, tabular figures for stable alignment.
- Scale: hero `text-4xl md:text-6xl font-bold tracking-tight`, h2 `text-2xl md:text-3xl font-bold tracking-tight`, label `text-xs font-semibold uppercase tracking-[0.14em]`, body `text-base`, metric `font-mono text-3xl font-bold`.

## Elevation & Depth

Three tiers: flat `background` canvas, `card` surfaces with a 1px inner top highlight plus soft `shadow-card`, and modals/overlays on `popover` with `shadow-elevated`. No glow or neon shadows — depth comes from layered surfaces and hairlines.

## Structural Zones

| Zone    | Background              | Border                    | Notes                                        |
| ------- | ----------------------- | ------------------------- | -------------------------------------------- |
| Header  | `bg-gradient-header`    | `border-b border-border`  | Sticky app bar with wordmark + status dot    |
| Content | `bg-background`         | —                         | Sections alternate `bg-card` and `bg-muted/30` |
| Footer  | `bg-card`               | `border-t border-border`  | Primary action dock with safe-area padding   |

## Spacing & Rhythm

4px base unit; section gaps `space-y-6` mobile / `space-y-8` desktop; card padding `p-4` mobile / `p-6` desktop; metric groups use tight `gap-1` label-to-value coupling.

## Component Patterns

- Buttons: large pill/rounded-2xl, `min-h-14` tap targets, gradient electric-blue primary with `shadow-action`, outlined secondary on `bg-card`; hover lifts brightness, active scales to 0.98.
- Cards: `rounded-2xl`, `bg-card` (or `bg-gradient-surface`), 1px `border-border` hairline, `shadow-card`; telemetry cards add a 3px electric-blue left rule.
- Badges: pill, `bg-muted` neutral or tinted `success`/`warning`/`destructive` at low chroma with matching text token.

## Motion

- Entrance: content blocks `animate-fade-up` staggered 60ms; overlays `animate-scale-in` 250ms.
- Hover: `transition-smooth` brightness/translate lift on buttons and cards; focus ring always visible.
- Decorative: `pulse-ring` on live status dot, `shimmer` on loading skeletons, `gauge-sweep` on the device-health gauge.
- All motion collapses under `prefers-reduced-motion`.

## Constraints

- Dark mode is the primary and only shipped theme; `:root` mirrors dark values.
- Tokens only — no raw hex/rgb in components; consume via Tailwind semantic classes.
- Mobile-first, must stay smooth on Samsung Galaxy A13: animate transform/opacity only, no heavy blur.
- Large tap targets (min 44px) and readable contrast are mandatory for accessibility.
- Never present simulated values as real device data; unavailable metrics show an explicit "Dado não disponível" state.

## Signature Detail

The telemetry card — uppercase micro-label, electric-blue hairline rule, and oversized monospace value — turns every reading into a cockpit instrument, giving the app a distinctive instrumentation identity.
