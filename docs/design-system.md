# Design System

## Visual Identity: "The Silent Authority"

Dark, precision-focused aesthetic inspired by hi-fi audio equipment and military control systems. Warm charcoal surfaces, oxblood accents, monospace typography, sharp corners.

## Typography

| Token | Font | Usage |
|-------|------|-------|
| `--font-heading` | Space Grotesk Variable | Node titles, panel headers, section labels |
| `--font-sans` | JetBrains Mono | Body text, form inputs, data |
| `--font-mono` | JetBrains Mono | Code, model names, technical values |

## Color Tokens

### Surfaces (elevation layers)
| Token | Purpose |
|-------|---------|
| `--background` | Canvas background |
| `--card` | Node body, panels, sidebar |
| `--popover` | Dropdowns, dialogs |
| `--surface-inset` | Chat bubbles, inset areas |

### Semantic
| Token | Purpose |
|-------|---------|
| `--primary` / `-foreground` / `-hover` | Primary actions (oxblood red) |
| `--secondary` / `-foreground` | Badges, secondary surfaces |
| `--muted` / `-foreground` | Metadata, counts, descriptions |
| `--accent` / `-foreground` | Hover states |
| `--destructive` | Delete, danger |
| `--border` / `--input` / `--ring` | Structural elements |

### Categorical Accent Scale
| Token | Purpose | Dark hex |
|-------|---------|----------|
| `--accent-1` | Agent nodes | #a52020 |
| `--accent-2` | Tool nodes | #c08040 |
| `--accent-3` | Skill nodes | #c0a050 |
| `--accent-4` | Channel nodes | #6b6058 |

Each has: base / `-foreground` / `-border` variants.

### Domain Mapping (`theme.ts`)
```
agent   → accent-1
tool    → accent-2
skill   → accent-3
channel → accent-4
```

## Component Variants

### Button (CVA)
Variants: `default`, `outline`, `secondary`, `ghost`, `ghost-destructive`, `ghost-on-primary`, `destructive`, `link`
Sizes: `default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`

### Badge (CVA)
Variants: `default`, `secondary`, `mono`, `destructive`, `outline`, `ghost`, `link`, `accent-1`, `accent-2`, `accent-3`, `accent-4`

## Rules

- No arbitrary Tailwind values (no `[#hex]`)
- All colors via CSS custom properties registered in `@theme inline`
- Domain-to-token mapping in `theme.ts`, NOT in CSS
- Use component variants, not className overrides
- Inline styles only for React Flow handles (require hex values)
- `prefers-reduced-motion` respected for grain texture and press effects
- WCAG AA contrast verified via Playwright (all text ≥4.5:1 in dark mode)
