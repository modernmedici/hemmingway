import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ConnectionBanner from '../ConnectionBanner';

let mockConnectionStatus = 'connected';

vi.mock('../../lib/db', () => ({
  default: {
    useConnectionStatus: () => mockConnectionStatus,
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockConnectionStatus = 'connected';
});

describe('ConnectionBanner', () => {
  it('renders nothing when connected', () => {
    mockConnectionStatus = 'connected';
    const { container } = render(<ConnectionBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('shows disconnection warning when status is closed', () => {
    mockConnectionStatus = 'closed';
    render(<ConnectionBanner />);
    expect(screen.getByText(/connection lost/i)).toBeInTheDocument();
  });

  it('shows disconnection warning when status is errored', () => {
    mockConnectionStatus = 'errored';
    render(<ConnectionBanner />);
    expect(screen.getByText(/connection lost/i)).toBeInTheDocument();
  });

  it('shows a reload button when disconnected', () => {
    mockConnectionStatus = 'closed';
    render(<ConnectionBanner />);
    expect(screen.getByText(/reload/i)).toBeInTheDocument();
  });

  it('renders nothing during initial connecting state', () => {
    mockConnectionStatus = 'connecting';
    const { container } = render(<ConnectionBanner />);
    expect(container.firstChild).toBeNull();
  });
});
