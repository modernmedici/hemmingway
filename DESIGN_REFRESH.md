# Design Refresh: Collaboration Features

## Original Aesthetic
- **Tone**: Warm Academic / Editorial
- **Palette**: Cream whites, soft browns, muted beiges
- **Typography**: Libre Baskerville (serif) + Inter (sans)
- **Vibe**: Focused, literary, timeless

## Current Issues

### 1. Avatar Colors
**Problem**: Electric bright colors (100% saturation) clash with muted palette
- Current: hsl(210, 100%, 56%) electric blue
- Should be: Warm earth tones matching the academic aesthetic

### 2. Presence Indicators
**Problem**: Might be too prominent/distracting
- Need subtle, editorial styling
- Should fade into background when not actively needed

### 3. Banners
**Problem**: Primary color backgrounds might be too loud
- InvitationBanner uses bright backgrounds
- Should use softer, warmer tones

## Proposed Refresh

### New Avatar Palette
Warm, muted earth tones derived from original palette:
- Terracotta: hsl(15, 40%, 55%)
- Sage: hsl(110, 25%, 50%)
- Clay: hsl(35, 35%, 50%)
- Slate: hsl(210, 15%, 45%)
- Ochre: hsl(40, 40%, 55%)
- Moss: hsl(85, 30%, 45%)
- Sand: hsl(45, 35%, 60%)
- Stone: hsl(200, 12%, 50%)

All colors:
- Desaturated (25-40% saturation vs 80-100%)
- Mid-tone lightness (45-60% vs 56%)
- Warm-leaning hues (earth tones)

### Refined Presence Bar
- More subtle, editorial typography
- Softer borders and backgrounds
- Fades when not hovered

### Softer Banners
- Use secondary/accent colors from original palette
- Warm beige/cream backgrounds instead of bright primary
- Maintain readability but reduce visual weight
