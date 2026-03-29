'use strict';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_TIMEOUT_MS = 15000;

/**
 * Ask the Anthropic API a Socratic coaching question about a post.
 *
 * Extracted as a pure function so it can be unit-tested without Electron IPC.
 *
 * @param {{ title: string, body: string|null }} payload
 * @param {{ get: (key: string) => string|undefined }} store  — electron-store instance
 * @param {typeof fetch} [fetchFn]  — injectable for tests
 * @param {number} [timeoutMs]      — injectable for tests
 * @returns {Promise<string>}       — the coaching question text
 * @throws {{ code: 'auth'|'busy'|'timeout'|'error' }}
 */
async function askCoach(payload, store, fetchFn = fetch, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const apiKey = store.get('anthropic_api_key');
  if (!apiKey) throw { code: 'auth' };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const body = payload.body?.slice(0, 2000) || '(no draft yet)';
  const title = (payload.title ?? '').slice(0, 500);

  try {
    const res = await fetchFn(ANTHROPIC_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 250,
        system:
          'You are a Socratic writing coach for professional posts. ' +
          'Ask ONE hard question that helps the writer clarify their argument. ' +
          'Be direct. Never write the post for them. ' +
          'Reply in 30 words or fewer.',
        messages: [{ role: 'user', content: `${title}\n\n${body}` }],
      }),
    });

    if (res.status === 401) throw { code: 'auth' };
    if (res.status === 429 || res.status === 529) throw { code: 'busy' };
    if (!res.ok) throw { code: 'error' };

    const data = await res.json();
    const text = data?.content?.[0]?.text;
    if (!text) throw { code: 'error' };
    return text;
  } catch (e) {
    if (e?.code) throw e;                          // already normalized
    if (e?.name === 'AbortError') throw { code: 'timeout' };
    throw { code: 'error' };                       // normalize all other errors
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { askCoach };
