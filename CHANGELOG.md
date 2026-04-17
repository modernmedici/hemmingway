# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0.0] - 2026-04-17

### Added
- Drag-and-drop for kanban cards with position-aware reordering
- Inline board rename and delete for board owners
- ConnectionBanner showing InstantDB connection status with reload option
- Mobile-responsive layout (columns stack on mobile, responsive header padding)
- Touch target improvements (44×44px minimum on three-dot menus, Share button)
- Bulk export via posts prop to AppShell
- Edit lock detection comparing userId instead of email

### Changed
- Column headers increased from 12px to 13px for readability
- WritingView toolbar spacing optimized for mobile (removed desktop offset, hid fullscreen button on mobile)
- handleSave now awaits async operations before switching views (fixes Safari post loss bug)
- Share Board button reduced to 28px height on desktop
- PostCard drag handle isolated to title to prevent menu interaction conflicts

### Fixed
- Safari mobile post loss: posts now save before view switches
- Auto-save no longer closes editor unexpectedly
- Timestamp preservation during drag-and-drop and column changes
- Broken mobile layout (3 columns side-by-side → stacked)
- Undersized touch targets (18px → 44px on menu buttons)
- Drag listeners capturing menu button clicks

### Removed
- Unused Swift files (TextCleaner, TranscriptionService)
- Unused asset images (hero.png, react.svg, vite.svg)
- .gstack QA report screenshots
