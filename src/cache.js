
// TODO útfæra redis cache

/*
Keyrt með:
node 03.redis-cache.js
Reiknar n-tu fibonacci tölu, athugar cache áður.
*/

import redis from 'redis';
import util from 'util';

const REDIS_URL = 'redis://127.0.0.1:6379/0';

let client;

if (REDIS_URL) {
  client = redis.createClient({ url: REDIS_URL });
}

const asyncGet = util.promisify(client.get).bind(client);
const asyncSet = util.promisify(client.set).bind(client);

export async function getCached(key) {
  if (!client || !asyncGet) {
    return null;
  }
  let cached;
  try {
    cached = await asyncGet(key);
  } catch (e) {
    console.warn(`unable to get from cache, ${key}, ${e.message}`);
    return null;
  }

  if (!cached) {
    return null;
  }
  let result;

  try {
    result = JSON.parse(cached);
  } catch (e) {
    console.warn(`unable to parse cached data, ${key}, ${e.message}`);
    return null;
  }
  return result;
}

export async function setCached(key, data, time) {
  if (!client || !asyncSet) {
    return false;
  }

  try {
    const serialized = JSON.stringify(data);
    await asyncSet(key, serialized, 'EX', time);
  } catch (e) {
    console.warn('unable to set cache for ', key);
    return false;
  }

  return true;
}

client.on('error', (err) => {
  console.log('Redis error ', err);
});
