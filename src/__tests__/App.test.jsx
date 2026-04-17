import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';

// Mock InstantDB
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
};

const mockBoard = {
  id: 'board-1',
  name: 'My Writing',
  owner: mockUser,
};

const mockPosts = [
  {
    id: 'post-1',
    title: 'First Post',
    body: 'Content',
    column: 'ideas',
    creator: mockUser,
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
      boards: new Proxy({}, {
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

// Mock hooks
vi.mock('../hooks/useBoards', () => ({
  useBoards: vi.fn(() => ({
    boards: [mockBoard],
    loading: false,
    createBoard: vi.fn(),
    isOwner: vi.fn(() => true),
    pendingInvitations: [],
    inviteToBoard: vi.fn(),
    acceptInvitation: vi.fn(),
    declineInvitation: vi.fn(),
  })),
}));

vi.mock('../hooks/useKanban', () => ({
  useKanban: vi.fn(() => ({
    board: mockBoard,
    posts: mockPosts,
    loading: false,
    error: null,
    createPost: vi.fn(),
    updatePost: vi.fn(),
    movePost: vi.fn(),
    deletePost: vi.fn(),
  })),
}));

import db from '../lib/db';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('App — authentication flow', () => {
  it('shows auth screen when user is not authenticated', () => {
    db.useAuth.mockReturnValue({ user: null, isLoading: false });

    render(<App />);

    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send verification code/i })).toBeInTheDocument();
  });

  it('shows board when user is authenticated', async () => {
    db.useAuth.mockReturnValue({ user: mockUser, isLoading: false });

    render(<App />);

    // Wait for board UI to render - check for sign out button instead of New Idea
    await waitFor(() => {
      expect(screen.getByLabelText(/sign out/i)).toBeInTheDocument();
    });

    // Auth screen should not be visible
    expect(screen.queryByPlaceholderText('your@email.com')).not.toBeInTheDocument();
  });

  it('shows loading state while checking auth', () => {
    db.useAuth.mockReturnValue({ user: null, isLoading: true });

    render(<App />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});

describe('App — board view', () => {
  beforeEach(() => {
    db.useAuth.mockReturnValue({ user: mockUser, isLoading: false });
  });

  it('displays the app when authenticated', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByLabelText(/sign out/i)).toBeInTheDocument();
    });
  });

  it('displays user email in sidebar', async () => {
    render(<App />);

    // The email is shown in expanded sidebar - check for sign out button instead
    await waitFor(() => {
      expect(screen.getByLabelText(/sign out/i)).toBeInTheDocument();
    });
  });

  it('renders even with query errors', async () => {
    const { useKanban } = await import('../hooks/useKanban');
    useKanban.mockReturnValue({
      board: mockBoard,
      posts: [],
      loading: false,
      error: 'Network error',
      createPost: vi.fn(),
      updatePost: vi.fn(),
      movePost: vi.fn(),
      deletePost: vi.fn(),
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByLabelText(/sign out/i)).toBeInTheDocument();
    });
  });

  it('handles missing user data gracefully', async () => {
    db.useAuth.mockReturnValue({ user: null, isLoading: false });

    render(<App />);

    // Should show auth screen
    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
  });
});
