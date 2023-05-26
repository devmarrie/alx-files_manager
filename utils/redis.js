import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.client.on('error', (err) => {
      console.log(`Unable to connect to redis ${err}`);
    });
  }

  isAlive() {
    // return new Promise((resolve) => {
    //   this.client.on('connect', () => {
    //     resolve(true);
    //   });
    // });
    this.client.on('connect', () => {
      // console.log('Redis successfully connected');
    });
    return true;
  }

  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, value) => {
        if (err) {
          reject(err);
        } else {
          resolve(value);
        }
      });
    });
  }

  async set(key, value, duration) {
    return new Promise((resolve) => {
      this.client.setex(key, duration, value);
      resolve(value);
    //   this.client.setex(key, value, duration, (err, result) => {
    //     if (err) {
    //       reject(err);
    //     } else {
    //       resolve(result);
    //     }
    //   });
    });
  }

  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err, val) => {
        if (err) {
          reject(err);
        } else {
          resolve(val);
        }
      });
    });
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
