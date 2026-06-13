/**
 * Optional DNS patch helper.
 *
 * The backend database connector can optionally override DNS behavior
 * to improve mongodb+srv:// reliability in restricted environments.
 */

function patchDnsIfNeeded() {
  // This project already runs fine without a DNS override.
  // If DNS_SERVER_HOST/DNS_SERVER_PORT are provided, attempt to
  // configure Node's DNS resolver.
  try {
    const dns = require('dns');
    const env = require('../src/config/env');

    if (!env.DNS_SERVER_HOST) return;

    const port = env.DNS_SERVER_PORT ?? 53;
    // Node's dns.setServers expects string[] of IP/host. Some environments
    // may require an IP literal. We accept the provided host.
    dns.setServers([`${env.DNS_SERVER_HOST}:${port}`]);
    // Note: dns.setServers supports host:port entries in Node.
  } catch (err) {
    // Keep server startup resilient; DNS patch is optional.
    console.warn('[DNS] patchDnsIfNeeded failed:', err?.message || err);
  }
}

module.exports = { patchDnsIfNeeded };

