# Work Record: Layout Variants for MosqueDisplay.tsx

## Task
Add support for 3 new layout variant themes (nabawi, makkah, cordoba) with distinctly different visual layouts — not just color changes but different component positions.

## Changes Made

### 1. `src/types/masjid.ts`
- Added `ThemeLayout` type: `'default' | 'nabawi' | 'makkah' | 'cordoba'`
- Added `ThemeConfig` interface with optional `layout` field
- Changed `THEMES` to `Record<string, ThemeConfig>` (from inline type)
- Added 3 new theme entries:
  - `nabawi`: Deep emerald green + gold, layout: 'nabawi' (right sidebar prayers)
  - `makkah`: Dark gold shimmer, layout: 'makkah' (top bar prayers)
  - `cordoba`: Warm parchment, layout: 'cordoba' (split horizontal)
- Extended `theme` union type in `MasjidConfig` to include `'nabawi' | 'makkah' | 'cordoba'`

### 2. `src/app/globals.css`
- Added `.theme-nabawi` with emerald green gradient + geometric pattern overlay
- Added `.nabawi-sidebar`, `.nabawi-prayer-card`, `.nabawi-prayer-card-active`, `.nabawi-prayer-card-passed`
- Added `.theme-makkah` with dark gold shimmer + particle effects
- Added `.makkah-top-bar`, `.makkah-prayer-card`, `.makkah-prayer-card-active`, `.makkah-prayer-card-passed`
- Added `.theme-cordoba` with warm parchment + texture overlay (light theme)
- Added `.cordoba-split-left`, `.cordoba-split-right`, `.cordoba-prayer-card`, `.cordoba-prayer-card-active`, `.cordoba-prayer-card-passed`
- Added `.layout-vertical-divider`, `.layout-horizontal-divider` shared utilities

### 3. `src/components/masjid/MosqueDisplay.tsx`
- Added `const layout = theme.layout || 'default'` derived value
- Modified `<main>` section with 4-way conditional layout rendering:
  - **default**: Original centered clock + bottom prayer bar (unchanged)
  - **nabawi**: Flex-row — left content + 320px right sidebar with vertical prayer cards
  - **makkah**: Flex-col — top prayer bar + centered content below
  - **cordoba**: Split — left 55% (clock area) + right 45% (2-column prayer grid)
- Bottom prayer bar wrapped with `{layout === 'default' && (...)}`
- Info panel, header, footer, overlays unchanged across all layouts

### 4. `src/components/masjid/SettingsPanel.tsx`
- Added 3 new entries to `THEME_OPTIONS` with `layout` and `description` fields
- Added new "Tampilan Berbeda (Layout Variant)" section with:
  - InfoBanner explaining these themes have different layouts
  - Mini layout preview thumbnails showing the visual arrangement
  - Description text for each layout variant

## Verification
- ✅ `bun run lint` passes (0 errors, 1 pre-existing warning)
- ✅ Dev server compiles successfully
- ✅ All existing themes and functionality preserved
---
Task ID: 1
Agent: main
Task: Fix theme issues - duplicate nabawi, light theme colors, adhan adaptation, layout cleanup

Work Log:
- Fixed duplicate theme entries in SettingsPanel.tsx: excluded layout variant themes (nabawi, makkah, cordoba) from dark/light theme filter sections using `!('layout' in t)` condition
- Fixed all light theme text colors in MosqueDisplay.tsx: replaced 17 instances of `isLight ? 'var(--text-muted)'` with `isLight ? 'var(--text-primary)'` for better readability on bright backgrounds
- Running text already had darker color for light themes (var(--text-primary))
- Header mosque name and subtitle updated to use var(--text-primary) for light themes
- Date displays across all layouts (header, nabawi, makkah, cordoba, default) updated
- Prayer card Latin text and secondary text updated for light themes
- Added light theme adhan overlay (adhan-mode-light) with cream/warm background and dark text, no glow effects
- Iqomah overlay kept unchanged (always dark) as per user request
- Added CSS classes: .adhan-mode-light, .adhan-light-text-latin, .adhan-light-text-arabic, .adhan-light-text-latin-prayer, .adhan-light-countdown
- Improved light theme prayer card CSS: increased background opacity (0.65→0.75), stronger borders (35%→40%), more shadow
- Added padding to nabawi-prayer-card (0.625rem 0.875rem), makkah-prayer-card (0.5rem 0.625rem), cordoba-prayer-card (0.625rem 0.75rem)
- Made nabawi sidebar responsive: w-[280px] sm:w-[320px] with justify-center
- Redesigned cordoba layout from 2-column grid to horizontal list cards (left: Arabic+Latin, right: Time+Iqomah) for cleaner appearance
- Updated cordoba mini-preview in SettingsPanel from grid to horizontal bars
- All changes compile cleanly with no lint errors

Stage Summary:
- Nabawi duplicate: FIXED (excluded from dark/light sections, only shows in layout variant section)
- Light theme text colors: FIXED (all secondary text now uses var(--text-primary) for better contrast)
- Adhan light adaptation: FIXED (new light adhan overlay with warm cream background)
- Iqomah: UNCHANGED (stays dark as requested)
- Layout themes: CLEANED UP (proper padding, responsive sizing, cordoba redesigned as list)
