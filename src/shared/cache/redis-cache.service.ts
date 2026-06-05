import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisCacheService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly logger = new Logger(RedisCacheService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = parseInt(this.configService.get<string>('REDIS_PORT', '6379'), 10);

    this.client = new Redis({ host, port });
    this.client.on('error', (error) => this.logger.error('Redis connection error', error));
    this.logger.log(`Connected to Redis ${host}:${port}`);
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl: number): Promise<void> {
    await this.client.set(key, value, 'EX', ttl);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async delByPattern(pattern: string): Promise<number> {
    let deleted = 0;
    const stream = this.client.scanStream({ match: pattern, count: 100 });
    for await (const keys of stream) {
      if (keys.length) {
        deleted += await this.client.del(...keys);
      }
    }
    return deleted;
  }
}
