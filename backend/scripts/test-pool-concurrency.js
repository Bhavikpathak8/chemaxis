const { pool, getPoolStats } = require('../src/db/pool');

async function main() {
  console.log('=== TESTING POSTGRESQL POOL CONCURRENCY DIRECTLY ===');
  console.log('Testing 100 simultaneous concurrent DB queries...');

  const startTime = performance.now();
  const latencies = [];
  let success = 0;
  let errors = 0;

  const promises = Array.from({ length: 100 }, async (_, idx) => {
    const t0 = performance.now();
    try {
      const res = await pool.query('SELECT $1::int AS idx, NOW() AS db_time, pg_backend_pid() AS pid', [idx]);
      const dur = performance.now() - t0;
      latencies.push(dur);
      success++;
      return res.rows[0];
    } catch (err) {
      errors++;
      console.error(`Query #${idx} failed:`, err.message);
    }
  });

  await Promise.all(promises);
  const totalDuration = performance.now() - startTime;
  const stats = await getPoolStats();

  latencies.sort((a, b) => a - b);
  const avg = (latencies.reduce((s, v) => s + v, 0) / latencies.length).toFixed(2);
  const p95 = latencies[Math.floor(latencies.length * 0.95)].toFixed(2);
  const p99 = latencies[Math.floor(latencies.length * 0.99)].toFixed(2);

  console.log(`\nDirect DB Results:`);
  console.log(`  Total Queries:     100`);
  console.log(`  Successful:        ${success}`);
  console.log(`  Failed:            ${errors}`);
  console.log(`  Total Time:        ${totalDuration.toFixed(2)}ms`);
  console.log(`  Average Latency:   ${avg}ms`);
  console.log(`  P95 Latency:       ${p95}ms`);
  console.log(`  P99 Latency:       ${p99}ms`);
  console.log(`  Pool Stats After:  total=${stats.totalCount}, idle=${stats.idleCount}, waiting=${stats.waitingCount}`);

  await pool.end();
}

main().catch(console.error);
