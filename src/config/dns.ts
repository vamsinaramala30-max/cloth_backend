import dns from 'dns';
import env from './env';

/**
 * Optional DNS patch helper.
 * If DNS_SERVER_HOST / DNS_SERVER_PORT are provided, override Node's DNS resolver.
 * This improves DNS reliability in restricted environments.
 */
export function patchDnsIfNeeded(): void {
  try {
    if (!env.DNS_SERVER_HOST) return;
    const port = env.DNS_SERVER_PORT ?? 53;
    dns.setServers([`${env.DNS_SERVER_HOST}:${port}`]);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[DNS] patchDnsIfNeeded failed:', message);
  }
}
