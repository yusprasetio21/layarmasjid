# Work Record: Layout Variants for MosqueDisplay.tsx

## Task
Add support for 3 new layout variants (nabawi, makkah, cordoba) to `MosqueDisplay.tsx`.

## Changes Made

### 1. Added `layout` derived variable (line 218)
```ts
const layout = theme.layout || 'default'
```

### 2. Modified the `<main>` section content area
Changed from a single default layout to a 4-way conditional:

- **nabawi**: Flex-row — left (mosque name + clock + date) + right 320px sidebar with prayer cards
- **makkah**: Flex-col — top prayer bar + horizontal divider + center content below
- **cordoba**: Split 55/45 — left (mosque name + clock + date) + right 2-col prayer grid
- **default**: Original centered layout + bottom prayer bar

### 3. Wrapped bottom prayer bar with `{layout === 'default' && (...)}`

## Verification
- ✅ `bun run lint` — 0 errors
- ✅ Dev server compiles successfully
- ✅ All existing functionality preserved
