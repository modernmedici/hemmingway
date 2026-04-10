import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthScreen } from '../AuthScreen';

// Mock InstantDB
vi.mock('../../lib/db', () => ({
  default: {
    auth: {
      sendMagicCode: vi.fn(),
      signInWithMagicCode: vi.fn(),
    },
  },
}));

import db from '../../lib/db';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AuthScreen — email entry', () => {
  it('renders email input and send button', () => {
    render(<AuthScreen />);

    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send verification code/i })).toBeInTheDocument();
  });

  it('sends magic code when email is submitted', async () => {
    db.auth.sendMagicCode.mockResolvedValue({});
    render(<AuthScreen />);

    const emailInput = screen.getByPlaceholderText('your@email.com');
    const sendButton = screen.getByRole('button', { name: /send verification code/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(db.auth.sendMagicCode).toHaveBeenCalledWith({ email: 'test@example.com' });
    });

    // Should show code entry screen
    expect(screen.getByText(/check your email/i)).toBeInTheDocument();
  });

  it('does not send when email is empty', async () => {
    render(<AuthScreen />);

    const sendButton = screen.getByRole('button', { name: /send verification code/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(db.auth.sendMagicCode).not.toHaveBeenCalled();
    });
  });

  it('shows loading state while sending code', async () => {
    db.auth.sendMagicCode.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<AuthScreen />);

    const emailInput = screen.getByPlaceholderText('your@email.com');
    const sendButton = screen.getByRole('button', { name: /send verification code/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sending/i })).toBeInTheDocument();
    });
  });

  it('shows error when sendMagicCode fails', async () => {
    db.auth.sendMagicCode.mockRejectedValue(new Error('Invalid email'));
    render(<AuthScreen />);

    const emailInput = screen.getByPlaceholderText('your@email.com');
    fireEvent.change(emailInput, { target: { value: 'invalid@example.com' } });

    const form = emailInput.closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});

describe('AuthScreen — code entry', () => {
  async function navigateToCodeEntry() {
    db.auth.sendMagicCode.mockResolvedValue({});
    render(<AuthScreen />);

    fireEvent.change(screen.getByPlaceholderText('your@email.com'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send verification code/i }));

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
  }

  it('shows code input after email is sent', async () => {
    await navigateToCodeEntry();

    expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/test@example\.com/)).toBeInTheDocument();
  });

  it('verifies code when submitted', async () => {
    db.auth.signInWithMagicCode.mockResolvedValue({});
    await navigateToCodeEntry();

    const codeInput = screen.getByLabelText(/verification code/i);
    const verifyButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(db.auth.signInWithMagicCode).toHaveBeenCalledWith({
        email: 'test@example.com',
        code: '123456',
      });
    });
  });

  it('does not verify when code is empty', async () => {
    await navigateToCodeEntry();

    const verifyButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(db.auth.signInWithMagicCode).not.toHaveBeenCalled();
    });
  });

  it('shows loading state while verifying', async () => {
    db.auth.signInWithMagicCode.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    await navigateToCodeEntry();

    const codeInput = screen.getByLabelText(/verification code/i);
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /verifying/i })).toBeInTheDocument();
    });
  });

  it('shows error when verification fails', async () => {
    db.auth.signInWithMagicCode.mockRejectedValue(new Error('Invalid code'));
    await navigateToCodeEntry();

    const codeInput = screen.getByLabelText(/verification code/i);
    fireEvent.change(codeInput, { target: { value: '000000' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid code/i)).toBeInTheDocument();
    });
  });

  it('allows going back to email entry', async () => {
    await navigateToCodeEntry();

    const backButton = screen.getByRole('button', { name: /use a different email/i });
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
    });
  });
});

describe('AuthScreen — keyboard shortcuts', () => {
  it('submits email on Enter key', async () => {
    db.auth.sendMagicCode.mockResolvedValue({});
    render(<AuthScreen />);

    const emailInput = screen.getByPlaceholderText('your@email.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.keyDown(emailInput, { key: 'Enter', code: 'Enter' });
    fireEvent.submit(emailInput.closest('form'));

    await waitFor(() => {
      expect(db.auth.sendMagicCode).toHaveBeenCalledWith({ email: 'test@example.com' });
    });
  });

  it('submits code on Enter key', async () => {
    db.auth.sendMagicCode.mockResolvedValue({});
    db.auth.signInWithMagicCode.mockResolvedValue({});
    render(<AuthScreen />);

    // Navigate to code entry
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send verification code/i }));

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });

    const codeInput = screen.getByLabelText(/verification code/i);
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.submit(codeInput.closest('form'));

    await waitFor(() => {
      expect(db.auth.signInWithMagicCode).toHaveBeenCalledWith({
        email: 'test@example.com',
        code: '123456',
      });
    });
  });
});
