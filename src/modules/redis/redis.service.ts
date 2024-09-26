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

  async blacklistToken(tokenId: string) {
    await this.client.set(`blacklist:${tokenId}`, '1', 'EX', 3600); // Blacklist trong 1 giờ
  }
}
