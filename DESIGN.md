# Hemingway Design System

This document defines the design vocabulary for Hemingway — a focused writing tool with a warm, academic aesthetic.

## Design Principles

**1. Writing-first:** Every design decision serves the writer. Collaboration features are present but never compete with writing for attention.

**2. Warm Academic:** Beige/cream backgrounds, serif typography for content, sans for UI. Feels like a well-worn notebook, not a SaaS dashboard.

**3. Subtraction default:** Every UI element must earn its pixels. Remove decoration, keep purpose.

**4. Calm hierarchy:** Strong but not shouty. Typography and spacing create hierarchy without bold colors or heavy borders.

---

## Color System

Colors are defined as HSL values in `src/styles/tokens.css`. Use CSS variable names, not raw HSL values.

### Light Mode (Warm Academic)

**Backgrounds:**
- `--background` (#FDFBF7) - Main canvas, warm off-white
- `--card` (#FFFFFF) - PostCards, modals, elevated surfaces
- `--sidebar` (40 15% 96%) - Sidebar background, slightly darker than main
- `--secondary` (#F3F0E8) - Hover states, subtle emphasis

**Text:**
- `--foreground` (#2D2D2D) - Primary text, high contrast
- `--muted-foreground` (#737373) - Supporting text (timestamps, metadata)
- `--primary` (#333333) - Buttons, badges, emphasis
- `--primary-foreground` (#FDFBF7) - Text on primary bg

**Borders:**
- `--border` (#E8E6E1) - Default borders, dividers
- Use at 0.5 opacity for subtle borders: `border-border/50`
- Use at 0.2 opacity for very subtle: `border-border/20`

**Actions:**
- `--accent` (#E5D9C3) - Hover backgrounds, focus states
- `--destructive` (0 84% 60%) - Delete actions, errors

### When to Use Each Color

**`bg-background`** - Main app canvas, full-page backgrounds  
**`bg-card`** - PostCards, modals, dropdowns (elevated content)  
**`bg-sidebar`** - Left sidebar only  
**`bg-secondary`** - Hover states, subtle badges (word count pill removed for clutter)  
**`bg-accent`** - Hover states on buttons, menu items  
**`bg-primary`** - Primary action buttons, user badges  
**`bg-destructive`** - Destructive action buttons  

**Text colors:**
- `text-foreground` - Titles, primary content
- `text-foreground/70` or `/80` - Secondary labels
- `text-muted-foreground` - Timestamps, metadata
- `text-muted-foreground/60` - Tertiary info (placeholder text)

---

## Typography

**Serif (Libre Baskerville):**
- Post titles
- Board names (h1)
- App logo
- Any content the user wrote

**Sans (Inter):**
- All UI labels
- Buttons
- Timestamps
- Navigation
- System messages

**Scale:**
- `text-4xl` (36px) - App logo, auth headlines
- `text-2xl` (24px) - Board name
- `text-sm` (14px) - Post title
- `text-xs` (12px) - UI labels, buttons
- `text-[11px]` - Column headers (uppercase), timestamps
- `text-[10px]` - Metadata (word count, attribution)

**Font weight:**
- `font-bold` - Post titles, board names
- `font-semibold` - App logo
- `font-medium` - UI labels, buttons
- `font-normal` - Body text (default)

**When serif vs sans:**
- **User content = serif** (posts, board names)
- **System UI = sans** (buttons, labels, timestamps)

---

## Spacing Scale

Use Tailwind spacing utilities. Current scale in use:

**Micro:** 0.5 (2px), 1 (4px), 1.5 (6px), 2 (8px)  
**Small:** 3 (12px), 4 (16px), 5 (20px)  
**Medium:** 6 (24px), 8 (32px)  
**Large:** 12 (48px), 16 (64px)

**Component spacing:**
- PostCard: `p-3.5` (14px padding)
- Column: `p-5` (20px padding)
- Modal: `px-6 py-4` header, `px-6 py-5` body
- Button: `px-3 py-1.5` (small), `px-4 py-2.5` (medium)

**Gaps between elements:**
- PostCard to PostCard: `gap-2` (8px)
- Column to Column: `gap-5` (20px)
- Inline metadata: `gap-1` (4px), `gap-2` (8px)

---

## Border Radius

Defined in tokens.css:
- `--radius-sm: 0.3rem` (4.8px) - Small elements
- `--radius-md: 0.5rem` (8px) - Cards, buttons (default)
- `--radius-lg: 0.8rem` (12.8px) - Modals, large surfaces

**Usage:**
- PostCards: `rounded-md`
- Buttons: `rounded-md` or `rounded-sm`
- Modals: `rounded-lg`
- Badges: `rounded-full`
- User avatars: `rounded-full`

---

## Motion

**Durations:**
- `duration-100` (100ms) - Hover states, color changes
- `duration-150` (150ms) - Card shadows, button presses
- `duration-200` (200ms) - Modal entry, sheet slides
- `duration-300` (300ms) - Sidebar expand/collapse, significant state changes

**Easing:**
- Default: `ease-out` (most transitions)
- Modal entry: `ease` (natural momentum)
- Button press: Use `active:scale-95` for tactile feedback

**What to animate:**
- Hover states (color, background, shadow)
- Modal/sheet entry (opacity + y-offset)
- PostCard entrance (opacity + y-offset, staggered)
- Loading spinners (rotate)
- Button press (scale)

**What NOT to animate:**
- Text changes (instant)
- Layout shifts (jarring)
- Sidebar on every hover (use CSS transition on width)

---

## Component Patterns

### Buttons

**Primary button:**
```jsx
<button className="px-4 py-2.5 rounded-md bg-primary text-primary-foreground font-medium text-xs transition-opacity hover:opacity-90 active:scale-95">
  Label
</button>
```

**Secondary button (outline):**
```jsx
<button className="px-3 py-1.5 rounded-md border border-border/30 bg-transparent text-foreground/70 font-medium text-xs transition-colors hover:bg-secondary active:scale-95">
  Label
</button>
```

**Destructive button:**
```jsx
<button className="px-2 py-1.5 rounded-sm text-destructive text-xs hover:bg-destructive/10">
  Delete
</button>
```

**Loading state:**
```jsx
{loading && <Loader2 size={12} className="animate-spin" />}
{loading ? 'Saving...' : 'Save'}
```

### Cards (PostCard)

**Structure:**
1. Title first (hero, serif, bold)
2. Metadata row (word count + author, muted, sans)
3. Body preview (3 lines max, line-clamp-3)
4. Timestamp at bottom (tiny, muted)
5. Three-dot menu absolute positioned top-right

**Styling:**
```jsx
<div className="rounded-md bg-card p-3.5 border border-border/50 shadow-sm hover:shadow-md">
```

### Modals

**Structure:**
1. Backdrop (`bg-black/40`)
2. Modal (`bg-card border border-border/20 rounded-lg shadow-xl`)
3. Header (`px-6 py-4 border-b border-border/15`)
4. Body (`px-6 py-5`)

**Entry animation:**
```jsx
animate={{ opacity: 1, y: 0 }}
initial={{ opacity: 0, y: -8 }}
```

### Empty States

**Structure:**
1. Dashed border box
2. Icon (20% opacity, centered)
3. Headline (font-medium, foreground/70)
4. Supporting text (muted-foreground/60)

**Example:** See `Column.jsx` empty state messages.

---

## Accessibility

**Keyboard navigation:**
- All interactive elements must be keyboard accessible
- Focus states use `focus:ring-2 focus:ring-primary/50`
- Modal trap focus (future enhancement)

**Screen readers:**
- Use `aria-label` on icon-only buttons
- Loading buttons should announce state change (future enhancement)

**Touch targets:**
- Minimum 44px (py-2.5 on buttons achieves this)
- Clickable areas extend beyond visual bounds where needed

**Color contrast:**
- Foreground on background: 12:1 (WCAG AAA)
- Muted foreground on background: 4.5:1 (WCAG AA)

---

## Responsive Behavior

### Breakpoints

- **Desktop:** 1024px+ (default, 3-column layout)
- **Tablet:** 768px-1023px (2-column or tabs)
- **Mobile:** 375px-767px (single column or swipeable)

### Desktop (1024px+)

**Layout:**
- Sidebar: 64px collapsed, 256px expanded on hover
- Board: 3-column grid (Ideas | Drafts | Published)
- PostCard: Full metadata visible

### Tablet (768px-1023px)

**Layout:**
- Sidebar: Always collapsed (64px), no hover expansion (tap to open as overlay)
- Board: 2-column grid (Ideas+Drafts on left, Published on right) OR horizontal tabs
- PostCard: Same as desktop

**Alternative:** Tabs above board area with swiping between columns.

### Mobile (375px-767px)

**Layout:**
- Sidebar: Hidden. Hamburger menu in top-left reveals as full-screen overlay.
- Board: Single column at a time, horizontal tabs for switching (Ideas | Drafts | Published)
- PostCard: Touch targets increase to 48px minimum (py-3 instead of py-2)
- Three-dot menu becomes larger (20px icon instead of 14px)
- Board header: Board name + Share button stack vertically

**Navigation:**
- Swipe left/right to switch between columns
- Tap column tab to jump directly

**Writing View:**
- Full-screen by default (no sidebar visible)
- Save button becomes floating FAB (bottom-right)
- Back button in top-left

**Modals:**
- Full-screen on mobile (not centered dialog)
- Slide up from bottom

### Implementation Status

- ✅ Sidebar auto-hide works on all viewports
- ✅ Modals are responsive (max-width + padding)
- ❌ Board columns don't adapt (overflow below 1024px)
- ❌ No mobile navigation implemented
- ❌ Touch targets not increased for mobile

**Next steps:** Add Tailwind responsive classes (`md:grid-cols-2 lg:grid-cols-3`) to Board.jsx and AppShell.jsx.

---

## What NOT to Do

**Don't:**
- Add colored pill backgrounds (removed from word count for clutter)
- Use decorative icons (FileText icon removed from PostCard)
- Center-align content text (left-align for readability)
- Use animation for the sake of animation (logo flutter removed)
- Add emoji (this is a professional writing tool)
- Use default font stacks (Inter/Roboto/Arial)
- Create generic card grids with icons in circles

**Do:**
- Keep metadata lightweight and muted
- Let content (titles, body text) dominate visually
- Use serif for user content, sans for system UI
- Apply subtraction: remove before adding
- Test empty states (they're features, not edge cases)

---

## Future Considerations

**Mobile layout:** Board columns should stack vertically or become swipeable tabs.

**Dark mode:** Already defined in tokens.css. Needs testing for legibility.

**Accessibility audit:** Add ARIA landmarks, improve screen reader announcements.

**Keyboard shortcuts:** Add visible affordance for Cmd+S, Cmd+Enter, etc.

---

Last updated: 2026-04-14
