// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { askCoach } from '../coach.js';

function makeStore(key = 'test-api-key') {
  return { get: vi.fn(() => key) };
}

function makeOkFetch(text = 'What is your actual argument?') {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ content: [{ text }] }),
  });
}

function makeErrorFetch(status) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: () => Promise.resolve({}),
  });
}

describe('askCoach — success', () => {
  it('returns the question text from the API response', async () => {
    const result = await askCoach(
      { title: 'My idea', body: 'some thoughts' },
      makeStore(),
      makeOkFetch('Why does this matter to you?')
    );
    expect(result).toBe('Why does this matter to you?');
  });

  it('sends body truncated to 2000 chars', async () => {
    const longBody = 'x'.repeat(3000);
    const fetchFn = makeOkFetch();
    await askCoach({ title: 'T', body: longBody }, makeStore(), fetchFn);
    const body = JSON.parse(fetchFn.mock.calls[0][1].body);
    const userContent = body.messages[0].content;
    expect(userContent).toContain('T\n\n' + 'x'.repeat(2000));
    expect(userContent).not.toContain('x'.repeat(2001));
  });

  it('uses "(no draft yet)" when body is empty', async () => {
    const fetchFn = makeOkFetch();
    await askCoach({ title: 'T', body: '' }, makeStore(), fetchFn);
    const body = JSON.parse(fetchFn.mock.calls[0][1].body);
    expect(body.messages[0].content).toContain('(no draft yet)');
  });

  it('uses "(no draft yet)" when body is null', async () => {
    const fetchFn = makeOkFetch();
    await askCoach({ title: 'T', body: null }, makeStore(), fetchFn);
    const body = JSON.parse(fetchFn.mock.calls[0][1].body);
    expect(body.messages[0].content).toContain('(no draft yet)');
  });
});

describe('askCoach — errors', () => {
  it('throws { code: "auth" } when API key is missing', async () => {
    const store = makeStore(null);
    await expect(askCoach({ title: 'T', body: '' }, store, makeOkFetch()))
      .rejects.toMatchObject({ code: 'auth' });
  });

  it('throws { code: "auth" } on HTTP 401', async () => {
    await expect(askCoach({ title: 'T', body: '' }, makeStore(), makeErrorFetch(401)))
      .rejects.toMatchObject({ code: 'auth' });
  });

  it('throws { code: "busy" } on HTTP 429', async () => {
    await expect(askCoach({ title: 'T', body: '' }, makeStore(), makeErrorFetch(429)))
      .rejects.toMatchObject({ code: 'busy' });
  });

  it('throws { code: "busy" } on HTTP 529', async () => {
    await expect(askCoach({ title: 'T', body: '' }, makeStore(), makeErrorFetch(529)))
      .rejects.toMatchObject({ code: 'busy' });
  });

  it('throws { code: "error" } on HTTP 500', async () => {
    await expect(askCoach({ title: 'T', body: '' }, makeStore(), makeErrorFetch(500)))
      .rejects.toMatchObject({ code: 'error' });
  });

  it('throws { code: "error" } when content[0].text is missing', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ content: [] }),
    });
    await expect(askCoach({ title: 'T', body: '' }, makeStore(), fetchFn))
      .rejects.toMatchObject({ code: 'error' });
  });

  it('throws { code: "timeout" } when AbortController fires', async () => {
    const fetchFn = vi.fn().mockImplementation((_url, { signal }) => {
      return new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => {
          const err = new Error('aborted');
          err.name = 'AbortError';
          reject(err);
        });
      });
    });

    // Override timeout to 10ms for test speed
    await expect(askCoach({ title: 'T', body: '' }, makeStore(), fetchFn, 10))
      .rejects.toMatchObject({ code: 'timeout' });
  });

  it('throws { code: "error" } for unrecognized network errors (normalized)', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(askCoach({ title: 'T', body: '' }, makeStore(), fetchFn))
      .rejects.toMatchObject({ code: 'error' });
  });
});
