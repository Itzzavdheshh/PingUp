const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const pubClient = createClient({ url: redisUrl });
const subClient = pubClient.duplicate();
const redisClient = pubClient.duplicate(); // For general purpose like presence

Promise.all([
  pubClient.connect(),
  subClient.connect(),
  redisClient.connect()
]).then(() => {
  console.log('✅ Redis clients connected');
}).catch(err => {
  console.error('❌ Redis connection error:', err);
});

module.exports = {
  pubClient,
  subClient,
  redisClient
};
