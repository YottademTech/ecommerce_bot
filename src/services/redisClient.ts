import dotenv from 'dotenv';
import { createClient } from 'redis';

dotenv.config();

const redisUrl = process.env.REDIS_URL;
const redisClient = createClient({ url: redisUrl });

redisClient.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
  await redisClient.connect();
})();

export default redisClient; 