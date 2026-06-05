import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { Vehicle } from './entities/vehicle.entity';
import { CacheModule } from '../../shared/cache/cache.module';
import { AuditModule } from '../../shared/audit/audit.module';
import { MessagingModule } from '../../shared/messaging/messaging.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicle]),
    CacheModule,
    AuditModule,
    MessagingModule,
  ],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
