import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private brandsRepository: Repository<Brand>,
  ) {}

  async create(payload: CreateBrandDto) {
    const existing = await this.brandsRepository.findOne({ where: { name: payload.name } });
    if (existing) throw new BadRequestException('Brand already exists');
    const brand = this.brandsRepository.create(payload);
    return this.brandsRepository.save(brand);
  }

  findAll() {
    return this.brandsRepository.find();
  }

  async findById(id: string) {
    const brand = await this.brandsRepository.findOne({ where: { id } });
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async update(id: string, payload: UpdateBrandDto) {
    await this.brandsRepository.update(id, payload);
    return this.findById(id);
  }

  async remove(id: string) {
    const brand = await this.findById(id);
    return this.brandsRepository.remove(brand);
  }
}
