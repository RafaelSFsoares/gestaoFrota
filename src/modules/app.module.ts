import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { BrandsModule } from './brands/brands.module';
import { ModelsModule } from './models/models.module';
import { HealthModule } from './health/health.module';
import { CacheModule } from '../shared/cache/cache.module';
import { AuditModule } from '../shared/audit/audit.module';
import { MessagingModule } from '../shared/messaging/messaging.module';
import { dataSourceOptions } from '../config/typeorm/data-source';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(dataSourceOptions),
    AuthModule,
    CacheModule,
    AuditModule,
    MessagingModule,
    HealthModule,
    VehiclesModule,
    BrandsModule,
    ModelsModule,
  ],
})
export class AppModule {}
