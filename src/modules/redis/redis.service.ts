import { Injectable } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class RedisService {
  private client;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });
    this.client.connect();
  }

  async saveSession(key: string, token: string, expireTime: number) {
    await this.client.set(key, token, 'EX', expireTime);
  }

  async isTokenBlacklisted(tokenId: string): Promise<boolean> {
    return (await this.client.get(`blacklist:${tokenId}`)) !== null;
  }

  async blacklistToken(tokenId: string, expireInSeconds?: number) {
    if (expireInSeconds) {
      await this.client.set(`blacklist:${tokenId}`, '1', 'EX', expireInSeconds); // Blacklist for a specified duration
    } else {
      await this.client.set(`blacklist:${tokenId}`, '1'); // Blacklist indefinitely
    }
  }

  async logAllKeys() {
    const keys = await this.client.keys('*');
    for (const key of keys) {
      const type = await this.client.type(key);
      let value;

      switch (type) {
        case 'string':
          value = await this.client.get(key);
          break;
        case 'list':
          value = await this.client.lRange(key, 0, -1);
          break;
        case 'set':
          value = await this.client.sMembers(key);
          break;
        case 'hash':
          value = await this.client.hGetAll(key);
          break;
        case 'zset':
          value = await this.client.zRange(key, 0, -1);
          break;
        default:
          value = `Unsupported type: ${type}`;
      }

      console.log(
        `Key: ${key}, Type: ${type}, Value: ${JSON.stringify(value, null, 2)}`,
      );
    }
  }
}
