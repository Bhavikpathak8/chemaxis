async function main() {
  console.log('=== VERIFYING AUTH RATE LIMITING ===');
  const url = 'http://localhost:4000/api/v1/auth/login';

  let blockedAt = null;
  let retryAfter = null;

  for (let i = 1; i <= 20; i++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'test@example.com', password: 'wrong' }),
    });

    const limit = res.headers.get('x-ratelimit-limit');
    const remaining = res.headers.get('x-ratelimit-remaining');
    const retry = res.headers.get('retry-after');

    console.log(`Request #${i}: HTTP ${res.status} | Limit: ${limit} | Remaining: ${remaining} | Retry-After: ${retry}`);

    if (res.status === 429 && !blockedAt) {
      blockedAt = i;
      retryAfter = retry;
    }
  }

  console.log(`\nRate Limiting Result: ${blockedAt ? 'SUCCESS - Blocked at request #' + blockedAt + ' with Retry-After: ' + retryAfter + 's' : 'FAILED - No 429 received'}`);
}

main().catch(console.error);
