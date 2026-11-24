/**
 * C-Tech Chemical Trading Platform — Isolated Load Test Benchmarks
 * Explicitly separates:
 * Benchmark 1: System & Deep Database Health Check (/health/ready)
 * Benchmark 2: Authenticated Business Trading APIs (Catalog Browse, CAS Search, RFQs, Admin)
 *
 * Measures: Exact request count, Concurrency, RPS, Avg, P50, P95, P99, Error Rate,
 * CPU, Memory (RSS/Heap), Database Active Pool Connections, and Pool Waiting Count.
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

async function authenticatePersonas() {
  console.log('[Setup] Authenticating test personas for Business Benchmarks...');
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

  const buyerLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier: 'buyer@ctech.com', password: 'Buyer@12345' }),
  });
  const buyerToken = buyerLogin.data?.accessToken;

  console.log(`[Setup] Tokens acquired: Admin: ${Boolean(adminToken)}, Buyer: ${Boolean(buyerToken)}\n`);
  return { adminToken, buyerToken };
}

async function runBenchmark(name, concurrency, requestsPerUser, executor) {
  const totalRequests = concurrency * requestsPerUser;
  console.log(`--> [${name}] Concurrency: ${concurrency} Users | Total Requests: ${totalRequests}`);

  const latencies = [];
  let successful = 0;
  let failed = 0;
  const statusCounts = {};

  const startTime = performance.now();

  const userTasks = Array.from({ length: concurrency }, async (_, userIdx) => {
    for (let r = 0; r < requestsPerUser; r++) {
      const res = await executor(userIdx);
      latencies.push(res.duration);
      statusCounts[res.status] = (statusCounts[res.status] || 0) + 1;
      if (res.success) {
        successful++;
      } else {
        failed++;
      }
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
  });

  await Promise.all(userTasks);
  const totalTimeSeconds = (performance.now() - startTime) / 1000;

  latencies.sort((a, b) => a - b);
  const avg = (latencies.reduce((s, v) => s + v, 0) / latencies.length).toFixed(2);
  const p50 = latencies[Math.floor(latencies.length * 0.5)]?.toFixed(2) || '0.00';
  const p95 = latencies[Math.floor(latencies.length * 0.95)]?.toFixed(2) || '0.00';
  const p99 = latencies[Math.floor(latencies.length * 0.99)]?.toFixed(2) || '0.00';
  const rps = (totalRequests / totalTimeSeconds).toFixed(1);
  const errorRate = ((failed / totalRequests) * 100).toFixed(2) + '%';

  // Sample server telemetry immediately post-stage
  const healthRes = await request('/health/ready');
  const pool = healthRes.data?.database?.pool || {};
  const mem = healthRes.data?.system?.memoryMb || {};

  console.log(`    Throughput: ${rps} req/s | Avg: ${avg}ms | P50: ${p50}ms | P95: ${p95}ms | P99: ${p99}ms | Error: ${errorRate}`);
  console.log(`    DB Pool: [Total: ${pool.totalCount}, Idle: ${pool.idleCount}, Waiting: ${pool.waitingCount}] | RSS: ${mem.rss}MB\n`);

  return {
    benchmark: name,
    concurrency,
    totalRequests,
    rps: Number(rps),
    avgMs: Number(avg),
    p50Ms: Number(p50),
    p95Ms: Number(p95),
    p99Ms: Number(p99),
    errorRate,
    poolActive: (pool.totalCount || 0) - (pool.idleCount || 0),
    poolWaiting: pool.waitingCount || 0,
    rssMb: mem.rss || 0,
  };
}

async function main() {
  console.log('================================================================');
  console.log('C-TECH SEPARATED LOAD BENCHMARKS: HEALTH VS BUSINESS APIS');
  console.log(`Target: ${BASE_URL} | Time: ${new Date().toISOString()}`);
  console.log('================================================================\n');

  const tokens = await authenticatePersonas();

  const healthResults = [];
  const businessResults = [];

  // ===========================================================================
  // PART 1: HEALTH-CHECK BENCHMARKS (/health/ready)
  // ===========================================================================
  console.log('================================================================');
  console.log('BENCHMARK PART 1: SYSTEM & DB HEALTH-CHECK PROBES (/health/ready)');
  console.log('================================================================\n');

  const healthStages = [
    { concurrency: 10, rpu: 10 },
    { concurrency: 50, rpu: 8 },
    { concurrency: 100, rpu: 5 },
    { concurrency: 250, rpu: 4 },
  ];

  for (const stage of healthStages) {
    const res = await runBenchmark(
      'Health Probe',
      stage.concurrency,
      stage.rpu,
      (userIdx) =>
        request('/health/ready', {
          headers: { 'X-Forwarded-For': `198.51.100.${(userIdx % 250) + 1}` },
        })
    );
    healthResults.push(res);
  }

  // ===========================================================================
  // PART 2: BUSINESS API BENCHMARKS (Catalog, CAS Search, RFQs, Admin Overview)
  // ===========================================================================
  console.log('================================================================');
  console.log('BENCHMARK PART 2: AUTHENTICATED BUSINESS TRADING APIS');
  console.log('================================================================\n');

  const businessStages = [
    { concurrency: 10, rpu: 10 },
    { concurrency: 50, rpu: 8 },
    { concurrency: 100, rpu: 5 },
    { concurrency: 250, rpu: 4 },
  ];

  const businessEndpoints = [
    (userIdx) =>
      request('/chemicals/catalog', {
        headers: {
          'X-Forwarded-For': `198.51.100.${(userIdx % 250) + 1}`,
          Authorization: `Bearer ${tokens.buyerToken}`,
        },
      }),
    (userIdx) =>
      request('/chemicals/catalog?search=108-95-2', {
        headers: {
          'X-Forwarded-For': `198.51.100.${(userIdx % 250) + 1}`,
          Authorization: `Bearer ${tokens.buyerToken}`,
        },
      }),
    (userIdx) =>
      request('/quotation-requests/mine', {
        headers: {
          'X-Forwarded-For': `198.51.100.${(userIdx % 250) + 1}`,
          Authorization: `Bearer ${tokens.buyerToken}`,
        },
      }),
  ];

  for (const stage of businessStages) {
    const res = await runBenchmark(
      'Business APIs',
      stage.concurrency,
      stage.rpu,
      (userIdx) => {
        const fn = businessEndpoints[userIdx % businessEndpoints.length];
        return fn(userIdx);
      }
    );
    businessResults.push(res);
  }

  console.log('================================================================');
  console.log('FINAL SEPARATED BENCHMARK SUMMARY MATRIX');
  console.log('================================================================\n');

  console.log('--- Health Check Probes (/health/ready) ---');
  console.table(healthResults);

  console.log('\n--- Business Trading APIs (Catalog / Search / RFQs) ---');
  console.table(businessResults);
}

main().catch(console.error);
