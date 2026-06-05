import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongoClient, Collection } from 'mongodb';

@Injectable()
export class AuditService implements OnModuleInit, OnModuleDestroy {
  private client: MongoClient;
  private collection: Collection;
  private readonly logger = new Logger(AuditService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const uri = this.configService.get<string>('MONGODB_URI', 'mongodb://localhost:27017/gestao_frota_audit');
    this.client = new MongoClient(uri);
    await this.client.connect();
    const db = this.client.db();
    this.collection = db.collection('audit_logs');
    await this.collection.createIndex({ timestamp: -1 });
    this.logger.log('Connected to MongoDB audit_logs collection');
  }

  async onModuleDestroy() {
    await this.client.close();
  }

  async log(action: string, user: string, payload: unknown): Promise<void> {
    await this.collection.insertOne({
      action,
      user,
      payload,
      timestamp: new Date(),
    });
  }
}
