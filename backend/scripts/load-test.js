/**
 * C-Tech Chemical Trading Platform — Concurrent Load & Benchmark Script
 * Tests API performance under concurrent load (10, 50, 100 concurrent requests)
 * Measures: Requests/sec (RPS), Min, Avg, P95, and P99 latency.
 */

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:4000/api/v1';

async function measureRequest(endpoint) {
  const start = performance.now();
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`);
    const duration = performance.now() - start;
    return { success: res.ok, status: res.status, duration };
  } catch (err) {
    const duration = performance.now() - start;
    return { success: false, status: 0, duration, error: err.message };
  }
}

async function runConcurrencyStage(endpoint, concurrency, totalRequests) {
  console.log(`\n--- Concurrency: ${concurrency} users | Total Requests: ${totalRequests} ---`);
  const latencies = [];
  let successful = 0;
  let failed = 0;

  const startTime = performance.now();
  let remaining = totalRequests;

  async function worker() {
    while (remaining > 0) {
      remaining--;
      const result = await measureRequest(endpoint);
      latencies.push(result.duration);
      if (result.success) {
        successful++;
      } else {
        failed++;
      }
    }
  }

  // Launch workers
  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  const totalTimeSeconds = (performance.now() - startTime) / 1000;
  latencies.sort((a, b) => a - b);

  const min = latencies[0]?.toFixed(2) || 0;
  const max = latencies[latencies.length - 1]?.toFixed(2) || 0;
  const avg = (latencies.reduce((sum, v) => sum + v, 0) / latencies.length).toFixed(2);
  const p50 = latencies[Math.floor(latencies.length * 0.5)]?.toFixed(2) || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)]?.toFixed(2) || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)]?.toFixed(2) || 0;
  const rps = (totalRequests / totalTimeSeconds).toFixed(1);

  console.log(`  Completed in:  ${totalTimeSeconds.toFixed(2)}s`);
  console.log(`  Throughput:    ${rps} req/sec`);
  console.log(`  Success / Fail: ${successful} / ${failed}`);
  console.log(`  Latency (ms):  Min: ${min}ms | Avg: ${avg}ms | P50: ${p50}ms | P95: ${p95}ms | P99: ${p99}ms | Max: ${max}ms`);

  return { concurrency, totalRequests, rps, avg, p95, p99, successful, failed };
}

async function main() {
  console.log('================================================================');
  console.log('C-TECH TRADE DESK — PERFORMANCE & CONCURRENCY BENCHMARK');
  console.log(`Target: ${BASE_URL} | Endpoint: /health/ready (Deep DB Probe)`);
  console.log('================================================================');

  const stage1 = await runConcurrencyStage('/health/ready', 10, 50);
  const stage2 = await runConcurrencyStage('/health/ready', 50, 150);
  const stage3 = await runConcurrencyStage('/health/ready', 100, 200);

  console.log('\n================================================================');
  console.log('BENCHMARK SUMMARY');
  console.log('================================================================');
  console.table([stage1, stage2, stage3]);
}

main().catch(console.error);
