import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Vercel Analytics to prevent external script loading
vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
  track: vi.fn(),
}));

// Configure happy-dom to handle external scripts gracefully
if (typeof window !== 'undefined' && window.happyDOM) {
  window.happyDOM.setInnerWidth(1024);
  window.happyDOM.setInnerHeight(768);
}
