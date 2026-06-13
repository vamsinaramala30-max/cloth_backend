const dns = require('dns');
try {
  dns.setServers(['8.8.8.8']);
  console.log('DNS OK');
} catch (err) {
  console.error('DNS ERR', err.message);
  process.exit(1);
}
