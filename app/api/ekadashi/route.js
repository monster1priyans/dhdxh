import { NextResponse } from 'next/server';

/*
 * Server-side proxy for the Ekadashi Studio's Claude calls.
 *
 * The browser never sees the Anthropic API key: it POSTs { system, user }
 * here, and this route forwards the request to the Anthropic Messages API
 * using a key held server-side. This keeps the key out of client bundles
 * and avoids the browser CORS / CSP restrictions on api.anthropic.com.
 *
 * Key resolution (first match wins):
 *   1. ANTHROPIC_API_KEY environment variable (recommended)
 *   2. x-anthropic-key request header (bring-your-own-key from the client)
 */

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
const MAX_TOKENS = Number(process.env.ANTHROPIC_MAX_TOKENS || 1200);

function resolveKey(request) {
  return process.env.ANTHROPIC_API_KEY || request.headers.get('x-anthropic-key') || null;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { system, user } = body || {};
  if (typeof user !== 'string' || !user.trim()) {
    return NextResponse.json({ error: 'Missing "user" prompt' }, { status: 400 });
  }

  const apiKey = resolveKey(request);
  if (!apiKey) {
    return NextResponse.json(
      { error: 'No Anthropic API key configured. Set ANTHROPIC_API_KEY on the server or send an x-anthropic-key header.' },
      { status: 401 },
    );
  }

  const payload = {
    model: DEFAULT_MODEL,
    max_tokens: MAX_TOKENS,
    messages: [{ role: 'user', content: user }],
  };
  if (typeof system === 'string' && system.trim()) payload.system = system;

  // Retry transient failures (429 / 5xx / network) with a short backoff.
  let lastErr = null;
  for (let attempt = 0; attempt <= 2; attempt++) {
    try {
      const res = await fetch(ANTHROPIC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 429 || res.status >= 500) {
        lastErr = `Anthropic API ${res.status}`;
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        continue;
      }

      const data = await res.json();
      if (!res.ok) {
        const message = data?.error?.message || `Anthropic API ${res.status}`;
        return NextResponse.json({ error: message }, { status: res.status });
      }

      const text = (data.content || [])
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('\n')
        .trim();

      if (!text) {
        lastErr = 'Empty reply from model';
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        continue;
      }

      return NextResponse.json({ text });
    } catch (e) {
      lastErr = e?.message || 'Network error';
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }

  return NextResponse.json({ error: lastErr || 'Request failed' }, { status: 502 });
}
