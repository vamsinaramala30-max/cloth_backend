require('dotenv').config();
const env = require('./src/config/env');
const db = require('./config/db');

console.log('ENV OK', { nodeEnv: env.NODE_ENV, port: env.PORT, mongoUri: Boolean(env.MONGO_URI), dnsServer: env.DNS_SERVER_HOST, dnsPort: env.DNS_SERVER_PORT });

db()
  .then(() => {
    console.log('DB OK');
    process.exit(0);
  })
  .catch((error) => {
    console.error('DB ERR', error);
    if (error && error.stack) console.error(error.stack);
    process.exit(1);
  });
