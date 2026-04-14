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
- Post body (full text and previews)
- Board names (h1)
- App logo
- Any content the user wrote

**Sans (Plus Jakarta Sans):**
- All UI labels
- Buttons
- Timestamps
- Navigation
- System messages

**Why Plus Jakarta Sans:**
Rounded humanist sans with warmth that complements Libre Baskerville's traditional serifs. Excellent small-size rendering (critical for 12px UI labels). Less generic than Inter, adds character without competing with content. The rounded terminals create visual harmony with the warm beige/cream palette.

**Loading fonts:**
```html
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

Or via Tailwind CSS (recommended):
```js
// tailwind.config.js
theme: {
  extend: {
    fontFamily: {
      serif: ['Libre Baskerville', 'serif'],
      sans: ['Plus Jakarta Sans', 'sans-serif'],
    }
  }
}
```

**Scale:**
- `text-4xl` (36px) - App logo, auth headlines
- `text-2xl` (24px) - Board name
- `text-sm` (14px) - Post title (card view)
- `text-xs` (12px) - Post body preview (card view), UI labels, buttons
- `text-[11px]` - Column headers (uppercase), timestamps, metadata (word count, attribution)

**Why smaller text in cards:** Kanban board views require tighter density for scanning. Titles at 14px and previews at 12px let users quickly parse many cards. The WritingView uses much larger serif text (28-40px titles, 17px body) for focused reading and composition.

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
- WritingView: `padding-top: 64px` (128px in zen mode), `padding-bottom: 48px` - minimal breathing room, maximizes visible content

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

## Shadow Scale

Shadows create elevation and hierarchy without heavy borders. All shadows use `hsl(var(--foreground) / opacity)` to adapt to the color palette.

**Tiers:**
- `0 1px 3px hsl(var(--foreground) / 0.04)` - Default elevation (cards, buttons)
- `0 2px 6px hsl(var(--foreground) / 0.05)` - Hover state (lift on interaction)
- `0 2px 8px hsl(var(--foreground) / 0.06)` - Selected state (distinct but not shouty)
- `0 4px 16px hsl(var(--foreground) / 0.08)` - Modal elevation (clear separation from canvas)

**Usage:**
```jsx
// Default card
style={{ boxShadow: '0 1px 3px hsl(var(--foreground) / 0.04)' }}

// Hover state (add to className)
className="hover:shadow-[0_2px_6px_hsl(var(--foreground)/0.05)]"

// Selected card
style={{
  boxShadow: isSelected 
    ? '0 2px 8px hsl(var(--foreground) / 0.06)' 
    : '0 1px 3px hsl(var(--foreground) / 0.04)'
}}

// Modal
style={{ boxShadow: '0 4px 16px hsl(var(--foreground) / 0.08)' }}
```

**Why explicit shadow values:** Tailwind's shadow utilities (`shadow-sm`, `shadow-md`) don't adapt to CSS variables. Explicit HSL values ensure shadows match the palette and remain warm.

**Philosophy:** Shadows create depth through subtle lift, not harsh outlines. Each tier is perceptible but calm.

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

**Secondary button (shadow-based):**
```jsx
<button 
  className="px-3 py-1.5 rounded-md bg-card text-foreground/70 font-medium text-xs transition-all duration-150 hover:shadow-[0_2px_6px_hsl(var(--foreground)/0.05)] active:scale-95"
  style={{ boxShadow: '0 1px 3px hsl(var(--foreground) / 0.04)' }}
>
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
<div 
  className="rounded-md bg-card p-3.5 cursor-pointer transition-shadow duration-150"
  style={{
    border: '1px solid hsl(var(--border) / 0.5)',
    boxShadow: hovered 
      ? '0 2px 8px hsl(var(--foreground) / 0.06)' 
      : '0 1px 3px hsl(var(--foreground) / 0.04)'
  }}
>
```

### Selection States

**Principle:** Selection and focus use **border accent + shadow lift**, not dark fills or binary color inversion. This creates calm hierarchy: "felt, not shouted."

**Pattern:**
```jsx
// Unselected
style={{
  background: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border) / 0.3)',
  boxShadow: '0 1px 3px hsl(var(--foreground) / 0.04)',
}}

// Selected
style={{
  background: 'hsl(var(--card))', // stays light
  border: '2px solid hsl(var(--primary))', // accent border
  boxShadow: '0 2px 8px hsl(var(--foreground) / 0.06)', // shadow lift
}}
```

**Hover state (before selection):**
```jsx
className="hover:shadow-[0_2px_6px_hsl(var(--foreground)/0.05)]"
```

**When to use:**
- Role selector cards (ShareBoardModal)
- Tab selection (future tab components)
- Radio card groups
- Active board indicators

**What NOT to do:**
- Dark fills (`bg-primary`) that invert text color
- Heavy border changes without shadow coordination
- Color-only selection (always combine border + shadow)

### Modals

**Structure:**
1. Backdrop (warmed overlay: `hsl(var(--foreground) / 0.15)`)
2. Modal container (`bg-background border border-border/20 rounded-lg`)
3. Header (`px-6 py-4`, no border)
4. Body (`px-6 py-5`)

**Styling:**
```jsx
// Backdrop
<div style={{ background: 'hsl(var(--foreground) / 0.15)' }} />

// Modal
<div 
  className="bg-background border border-border/20 rounded-lg"
  style={{ boxShadow: '0 4px 16px hsl(var(--foreground) / 0.08)' }}
>
```

**Header typography pattern:**
```jsx
{/* System action label */}
<p className="text-sm font-sans text-foreground/70 mb-0.5">Share</p>
{/* User content hero */}
<h2 className="text-xl font-serif font-bold text-foreground">"{board.name}"</h2>
```

**Entry animation:**
```jsx
animate={{ opacity: 1, y: 0 }}
initial={{ opacity: 0, y: -8 }}
```

### Form Inputs

**Text input (standard):**
```jsx
<input
  type="email"
  className="w-full px-4 py-3 rounded-md bg-card border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
  placeholder="your@email.com"
/>
```

**Text input (inline/compact):**
```jsx
<input
  type="text"
  className="w-full px-2 py-1.5 text-sm bg-card border border-border rounded text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
  placeholder="Board name"
/>
```

**Textarea (distraction-free writing):**
```jsx
<textarea
  className="w-full bg-transparent border-none outline-none text-foreground"
  style={{ fontFamily: "'Libre Baskerville', serif" }}
/>
```

**Input states:**
- Default: `bg-card border-border`
- Focus: `focus:ring-2 focus:ring-primary/20` (subtle dark ring, not accent)
- Disabled: `disabled:opacity-50 disabled:cursor-not-allowed`
- Error: Add `border-destructive` (not shown by default)

**When to use each:**
- Standard inputs: Auth forms, modals, settings (full padding, comfortable)
- Compact inputs: Inline editing, dropdowns, quick create (less padding)
- Transparent: Writing views, content editing (no visual weight)

**Never use:**
- Colored backgrounds (`bg-secondary/30`) - inconsistent with card elevation
- Multiple focus state patterns - always use ring, not border color change
- `rounded-lg` on inputs - reserve for modals/large surfaces

### Empty States

**Structure:**
1. Dashed border box
2. Icon (20% opacity, centered)
3. Headline (font-medium, foreground/70)
4. Supporting text (muted-foreground/60)

**Example:** See `Column.jsx` empty state messages.

### Destructive Action Confirmation

**When to use:** Board deletion, account deletion, any action that destroys user data.

**Modal structure:**
1. Danger headline: "Delete '[Board Name]'?"
2. Impact statement: "This will permanently delete [N] posts. This cannot be undone."
3. Confirmation input: "Type the board name to confirm:" (text input, must match exactly)
4. Two buttons:
   - Cancel (secondary, left) - ESC key
   - Delete [N] posts (destructive bg, right) - disabled until input matches

**Example:**
```jsx
<Modal>
  <h2 className="text-lg font-semibold text-foreground">Delete "My Writing"?</h2>
  <p className="text-sm text-muted-foreground mt-2">
    This will permanently delete 47 posts. This cannot be undone.
  </p>
  <div className="mt-4">
    <label className="text-sm font-medium">Type the board name to confirm:</label>
    <input type="text" placeholder="My Writing" />
  </div>
  <div className="flex gap-2 mt-6">
    <button>Cancel</button>
    <button className="bg-destructive" disabled={!confirmed}>
      Delete 47 posts
    </button>
  </div>
</Modal>
```

**Why type-to-confirm:** Prevents accidental deletion from double-click or misclick. Forces user to read the board name and post count.

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
- Use generic overused fonts (Roboto, Arial, default system stack) - Plus Jakarta Sans has character
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

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-14 | A-level design refinement: shadow-based elevation system | Elevated all interactive components from border-based styling to shadow-based "warm academic" aesthetic. Replaced binary selection states (dark fills, inverted text) with calm hierarchy pattern: 2px primary border + shadow lift. Updated 7 components: ShareBoardModal, BoardSwitcher, sidebar buttons (New Idea, Sign Out), PostCard three-dot menu, board creation form, Share Board button. Documented explicit shadow scale (4 tiers), selection state pattern, and modal structure. Added success state animations (Check icon scale-in). Removed all header dividers from modals for visual lightness. Result: A-grade design that feels "felt, not shouted" - every element earns its pixels. |
| 2026-04-14 | Fixed WritingView scroll area - body textarea now auto-expands | Body textarea had fixed `min-h-[500px]` which cut off longer content. Added `bodyRef` and `autoResizeBody()` function (mirroring title auto-resize). Textarea now expands to fit all content via `scrollHeight` calculation. Page scrolls to show full essay instead of textarea having internal scroll. Also reduced bottom padding from 256px to 48px for better space utilization. |
| 2026-04-14 | Reduced PostCard text sizes for better scanning density | Title reduced from `text-base` (16px) to `text-sm` (14px). Body preview reduced from `text-sm` (14px) to `text-xs` (12px). Kanban board views need tighter density to scan many cards at once. WritingView retains large text (28-40px titles) for focused reading. |
| 2026-04-14 | Standardized form input patterns and removed hardcoded blue from auth | Auth buttons used hardcoded SaaS blue (`hsl(200, 70%, 50%)`) that violated warm academic palette. Replaced with `bg-primary`. Unified all form inputs: `bg-card`, `border-border`, `focus:ring-2 ring-primary/20`, `rounded-md`. Removed inconsistent patterns (`bg-secondary/30`, varying focus states). Documented standard and compact input patterns. |
| 2026-04-14 | Replaced Inter with Plus Jakarta Sans for UI typography | Rounded humanist sans with warmth that complements Libre Baskerville. Better small-size rendering at 12px (UI labels). Less generic than Inter - adds character without competing with content. Creates unified warm aesthetic across UI and content. |

---

Last updated: 2026-04-14
