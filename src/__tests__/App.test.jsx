import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock InstantDB
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
};

const mockPosts = [
  {
    id: 'post-1',
    title: 'First Post',
    body: 'Content',
    column: 'ideas',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

vi.mock('../lib/db', () => ({
  default: {
    useAuth: vi.fn(),
    useQuery: vi.fn(),
    transact: vi.fn(),
    tx: {
      posts: new Proxy({}, {
        get: () => ({
          update: vi.fn(),
          delete: vi.fn(),
          link: vi.fn(),
        }),
      }),
    },
    auth: {
      sendMagicCode: vi.fn(),
      signInWithMagicCode: vi.fn(),
    },
  },
}));

import db from '../lib/db';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('App — authentication flow', () => {
  it('shows auth screen when user is not authenticated', () => {
    db.useAuth.mockReturnValue({ user: null, isLoading: false });
    db.useQuery.mockReturnValue({ isLoading: false, error: null, data: null });

    render(<App />);

    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send verification code/i })).toBeInTheDocument();
  });

  it('shows board when user is authenticated', () => {
    db.useAuth.mockReturnValue({ user: mockUser, isLoading: false });
    db.useQuery.mockReturnValue({
      isLoading: false,
      error: null,
      data: {
        $users: [{
          id: mockUser.id,
          posts: mockPosts,
        }],
      },
    });

    render(<App />);

    expect(screen.getByText('Hemingway')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new idea/i })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('your@email.com')).not.toBeInTheDocument();
  });

  it('shows loading state while checking auth', () => {
    db.useAuth.mockReturnValue({ user: null, isLoading: true });
    db.useQuery.mockReturnValue({ isLoading: true, error: null, data: null });

    render(<App />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});

describe('App — board view', () => {
  beforeEach(() => {
    db.useAuth.mockReturnValue({ user: mockUser, isLoading: false });
  });

  it('displays the app when authenticated', () => {
    db.useQuery.mockReturnValue({
      isLoading: false,
      error: null,
      data: {
        $users: [{
          id: mockUser.id,
          posts: [],
        }],
      },
    });

    render(<App />);

    expect(screen.getByText('Hemingway')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new idea/i })).toBeInTheDocument();
  });

  it('displays user email in sidebar', () => {
    db.useQuery.mockReturnValue({
      isLoading: false,
      error: null,
      data: {
        $users: [{
          id: mockUser.id,
          posts: [],
        }],
      },
    });

    render(<App />);

    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
  });
});

describe('App — error handling', () => {
  beforeEach(() => {
    db.useAuth.mockReturnValue({ user: mockUser, isLoading: false });
  });

  it('renders even with query errors', () => {
    db.useQuery.mockReturnValue({
      isLoading: false,
      error: { message: 'Network error' },
      data: null,
    });

    render(<App />);

    // App should still render the board structure
    expect(screen.getByText('Hemingway')).toBeInTheDocument();
  });

  it('handles missing user data gracefully', () => {
    db.useQuery.mockReturnValue({
      isLoading: false,
      error: null,
      data: { $users: [] },
    });

    render(<App />);

    // Should render without crashing
    expect(screen.getByText('Hemingway')).toBeInTheDocument();
  });
});

describe('App — integration smoke test', () => {
  it('renders without crashing when not authenticated', () => {
    db.useAuth.mockReturnValue({ user: null, isLoading: false });
    db.useQuery.mockReturnValue({ isLoading: false, error: null, data: null });

    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  it('renders without crashing when authenticated', () => {
    db.useAuth.mockReturnValue({ user: mockUser, isLoading: false });
    db.useQuery.mockReturnValue({
      isLoading: false,
      error: null,
      data: {
        $users: [{
          id: mockUser.id,
          posts: [],
        }],
      },
    });

    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
});
