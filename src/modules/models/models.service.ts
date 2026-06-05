import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleModel } from './entities/vehicle-model.entity';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';

@Injectable()
export class ModelsService {
  constructor(
    @InjectRepository(VehicleModel)
    private modelsRepository: Repository<VehicleModel>,
  ) {}

  async create(payload: CreateModelDto) {
    const existing = await this.modelsRepository.findOne({ where: { name: payload.name, brand_id: payload.brand_id } });
    if (existing) throw new BadRequestException('Model already exists for this brand');
    const model = this.modelsRepository.create(payload);
    return this.modelsRepository.save(model);
  }

  findAll() {
    return this.modelsRepository.find();
  }

  async findById(id: string) {
    const model = await this.modelsRepository.findOne({ where: { id } });
    if (!model) throw new NotFoundException('Model not found');
    return model;
  }

  async update(id: string, payload: UpdateModelDto) {
    await this.modelsRepository.update(id, payload);
    return this.findById(id);
  }

  async remove(id: string) {
    const model = await this.findById(id);
    return this.modelsRepository.remove(model);
  }
}
