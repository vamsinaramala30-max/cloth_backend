const dns = require('dns');
try {
  dns.setServers(['8.8.8.8:53']);
  console.log('DNS OK 2');
} catch (err) {
  console.error('DNS ERR 2', err.message);
  process.exit(1);
}
