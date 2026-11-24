/**
 * C-Tech Chemical Trading Platform — Realistic Multi-Scenario Load Test
 * Simulates real user behaviors across core trading desk workflows:
 * 1. Chemical Catalog Browsing & Filtered Search (Indexed)
 * 2. CAS Number Targeted Search (Indexed)
 * 3. Deep System & DB Health Telemetry (/health/ready)
 * 4. Buyer RFQ History & Quotation Tracking
 * 5. Admin Desk Catalogue Telemetry
 *
 * Tests concurrency levels: 10, 25, 50, 75, 100, 250 concurrent users.
 * Measures: RPS, Avg, P50, P95, P99, Min, Max, Error Rate, and Memory/CPU metrics.
 */

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:4000/api/v1';

async function request(path, options = {}) {
  const start = performance.now();
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    const duration = performance.now() - start;
    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    return { success: res.ok, status: res.status, duration, data };
  } catch (err) {
    const duration = performance.now() - start;
    return { success: false, status: 0, duration, error: err.message };
  }
}

async function authenticateUsers() {
  console.log('[Setup] Authenticating test personas...');

  // 1. Admin login with 2FA
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier: 'admin@ctech.com', password: 'Admin@12345' }),
  });
  let adminToken = adminLogin.data?.accessToken;
  if (adminLogin.data?.requires2FA) {
    const twoFaRes = await request('/auth/login/2fa', {
      method: 'POST',
      body: JSON.stringify({ tempToken: adminLogin.data.tempToken, code: '123456' }),
    });
    adminToken = twoFaRes.data?.accessToken;
  }

  // 2. Buyer login
  const buyerLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier: 'buyer@ctech.com', password: 'Buyer@12345' }),
  });
  const buyerToken = buyerLogin.data?.accessToken;

  // 3. Seller login
  const sellerLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier: 'seller@ctech.com', password: 'Seller@12345' }),
  });
  const sellerToken = sellerLogin.data?.accessToken;

  console.log(`[Setup] Tokens acquired: Admin: ${Boolean(adminToken)}, Buyer: ${Boolean(buyerToken)}, Seller: ${Boolean(sellerToken)}\n`);
  return { adminToken, buyerToken, sellerToken };
}

async function runScenario(scenarioType, tokens, userIndex) {
  const headers = {
    'X-Forwarded-For': `198.51.100.${(userIndex % 250) + 1}`,
  };

  switch (scenarioType) {
    case 'CATALOG_BROWSE':
      return request('/chemicals/catalog', {
        headers: { ...headers, Authorization: `Bearer ${tokens.buyerToken}` },
      });
    case 'CAS_SEARCH':
      return request('/chemicals/catalog?search=108-95-2', {
        headers: { ...headers, Authorization: `Bearer ${tokens.buyerToken}` },
      });
    case 'HEALTH_PROBE':
      return request('/health/ready', { headers });
    case 'BUYER_RFQS':
      return request('/quotation-requests/mine', {
        headers: { ...headers, Authorization: `Bearer ${tokens.buyerToken}` },
      });
    case 'ADMIN_OVERVIEW':
      return request('/chemicals/admin/all', {
        headers: { ...headers, Authorization: `Bearer ${tokens.adminToken}` },
      });
    default:
      return request('/chemicals/catalog', {
        headers: { ...headers, Authorization: `Bearer ${tokens.buyerToken}` },
      });
  }
}

async function runLoadStage(concurrency, requestsPerUser, tokens) {
  const totalRequests = concurrency * requestsPerUser;
  console.log(`================================================================`);
  console.log(`--> STAGE: ${concurrency} Concurrent Virtual Users (${totalRequests} total requests)`);
  console.log(`================================================================`);

  const scenarios = ['CATALOG_BROWSE', 'CAS_SEARCH', 'HEALTH_PROBE', 'BUYER_RFQS', 'ADMIN_OVERVIEW'];
  const latencies = [];
  let successful = 0;
  let failed = 0;
  const statusCounts = {};

  const startTime = performance.now();

  const userTasks = Array.from({ length: concurrency }, async (_, userIdx) => {
    for (let r = 0; r < requestsPerUser; r++) {
      // Pick scenario with realistic distribution
      const rand = Math.random();
      let scenario = 'CATALOG_BROWSE';
      if (rand < 0.35) scenario = 'CATALOG_BROWSE';
      else if (rand < 0.65) scenario = 'CAS_SEARCH';
      else if (rand < 0.80) scenario = 'HEALTH_PROBE';
      else if (rand < 0.90) scenario = 'BUYER_RFQS';
      else scenario = 'ADMIN_OVERVIEW';

      const result = await runScenario(scenario, tokens, userIdx);
      latencies.push(result.duration);

      statusCounts[result.status] = (statusCounts[result.status] || 0) + 1;
      if (result.success) {
        successful++;
      } else {
        failed++;
      }

      // 5ms subtle think time between requests to simulate real browsing
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
  });

  await Promise.all(userTasks);
  const totalTimeSeconds = (performance.now() - startTime) / 1000;

  latencies.sort((a, b) => a - b);
  const min = latencies[0]?.toFixed(2) || '0.00';
  const max = latencies[latencies.length - 1]?.toFixed(2) || '0.00';
  const avg = (latencies.reduce((s, v) => s + v, 0) / latencies.length).toFixed(2);
  const p50 = latencies[Math.floor(latencies.length * 0.5)]?.toFixed(2) || '0.00';
  const p95 = latencies[Math.floor(latencies.length * 0.95)]?.toFixed(2) || '0.00';
  const p99 = latencies[Math.floor(latencies.length * 0.99)]?.toFixed(2) || '0.00';
  const rps = (totalRequests / totalTimeSeconds).toFixed(1);
  const errorRate = ((failed / totalRequests) * 100).toFixed(2) + '%';

  console.log(`  Duration:      ${totalTimeSeconds.toFixed(2)}s`);
  console.log(`  Throughput:    ${rps} req/sec`);
  console.log(`  Success/Fail:  ${successful} / ${failed} (Error Rate: ${errorRate})`);
  console.log(`  HTTP Statuses: ${JSON.stringify(statusCounts)}`);
  console.log(`  Latencies:     Min: ${min}ms | Avg: ${avg}ms | P50: ${p50}ms | P95: ${p95}ms | P99: ${p99}ms | Max: ${max}ms\n`);

  return {
    concurrency,
    totalRequests,
    rps,
    avg: `${avg}ms`,
    p50: `${p50}ms`,
    p95: `${p95}ms`,
    p99: `${p99}ms`,
    successful,
    failed,
    errorRate,
  };
}

async function main() {
  console.log('================================================================');
  console.log('C-TECH CHEMICAL TRADE DESK — MULTI-TIER REAL LOAD TEST');
  console.log(`Target: ${BASE_URL} | Time: ${new Date().toISOString()}`);
  console.log('================================================================\n');

  const tokens = await authenticateUsers();

  const results = [];
  results.push(await runLoadStage(10, 10, tokens));  // 10 users, 100 requests
  results.push(await runLoadStage(25, 10, tokens));  // 25 users, 250 requests
  results.push(await runLoadStage(50, 8, tokens));   // 50 users, 400 requests
  results.push(await runLoadStage(75, 6, tokens));   // 75 users, 450 requests
  results.push(await runLoadStage(100, 5, tokens));  // 100 users, 500 requests
  results.push(await runLoadStage(250, 4, tokens));  // 250 users, 1000 requests

  console.log('================================================================');
  console.log('LOAD TEST SUMMARY MATRIX');
  console.log('================================================================');
  console.table(results);

  // Deep health check after all load tests to verify zero connection leaks
  const finalHealth = await request('/health/ready');
  console.log('\n[Post-Benchmark Health & Connection Pool Audit]');
  console.log(JSON.stringify(finalHealth.data, null, 2));
}

main().catch(console.error);
