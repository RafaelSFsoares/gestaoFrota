import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelsController } from './models.controller';
import { ModelsService } from './models.service';
import { VehicleModel } from './entities/vehicle-model.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VehicleModel])],
  controllers: [ModelsController],
  providers: [ModelsService],
})
export class ModelsModule {}
