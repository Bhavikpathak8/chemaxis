/**
 * Persistent Public Tunnel for C-Tech Frontend & API Proxy
 * Automatically reconnects if connection drops.
 */

const { exec } = require('child_process');

function startTunnel() {
  console.log('[Tunnel] Spawning localtunnel for port 5173...');
  const proc = exec('npx --yes localtunnel --port 5173');

  proc.stdout.on('data', (data) => {
    console.log(data.toString().trim());
  });

  proc.stderr.on('data', (data) => {
    console.error('[Tunnel Log]', data.toString().trim());
  });

  proc.on('close', (code) => {
    console.log(`[Tunnel] Exited with code ${code}. Restarting in 3 seconds...`);
    setTimeout(startTunnel, 3000);
  });
}

startTunnel();
