import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { RedisCacheService } from '../../shared/cache/redis-cache.service';
import { AuditService } from '../../shared/audit/audit.service';
import { RabbitMQService } from '../../shared/messaging/rabbitmq.service';

@Injectable()
export class VehiclesService {
  private readonly cacheTtl = parseInt(process.env.CACHE_TTL || '60', 10);

  constructor(
    @InjectRepository(Vehicle)
    private vehiclesRepository: Repository<Vehicle>,
    private cacheService: RedisCacheService,
    private auditService: AuditService,
    private rabbitMQService: RabbitMQService,
  ) { }

  private buildListCacheKey(query: Record<string, unknown>): string {
    const params = [query.page, query.limit, query.plate, query.year, query.model, query.sortBy, query.order]
      .map((value) => String(value || ''))
      .join(':');
    return `vehicles:list:${params}`;
  }

  async create(payload: CreateVehicleDto) {
    const existing = await this.vehiclesRepository.findOne({
      where: [
        { license_plate: payload.license_plate },
        { renavam: payload.renavam },
        { chassis: payload.chassis },
      ],
    });

    if (existing) {
      throw new BadRequestException('Duplicate license plate, renavam or chassis');
    }

    const vehicle = this.vehiclesRepository.create(payload);
    const saved = await this.vehiclesRepository.save(vehicle);
    await this.cacheService.set(
      `vehicles:id:${saved.id}`,
      JSON.stringify(saved),
      this.cacheTtl,
    );
    await this.auditService.log('vehicle.created', payload.created_by, saved);
    await this.rabbitMQService.publish('vehicle.created', saved);
    return saved;
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    plate?: string;
    year?: number;
    model?: string;
    sortBy?: 'license_plate' | 'year' | 'created_at';
    order?: 'ASC' | 'DESC';
  }): Promise<{ data: Vehicle[]; total: number }> {
    const cacheKey = this.buildListCacheKey(query);
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as { data: Vehicle[]; total: number };
    }

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 && query.limit <= 100 ? query.limit : 10;
    const qb = this.vehiclesRepository.createQueryBuilder('vehicle');

    if (query.plate) qb.andWhere('vehicle.license_plate LIKE :plate', { plate: `%${query.plate}%` });
    if (query.year) qb.andWhere('vehicle.year = :year', { year: query.year });
    if (query.model) qb.andWhere('vehicle.model_id = :model', { model: query.model });

    const sortBy = ['license_plate', 'year', 'created_at'].includes(query.sortBy || '')
      ? query.sortBy
      : 'created_at';
    const order = query.order === 'ASC' ? 'ASC' : 'DESC';

    qb.orderBy(`vehicle.${sortBy}`, order)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    const result = { data, total };
    await this.cacheService.set(cacheKey, JSON.stringify(result), this.cacheTtl);
    return result;
  }

  async findById(id: string) {
    const cacheKey = `vehicles:id:${id}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as Vehicle;
    }

    const vehicle = await this.vehiclesRepository.findOne({ where: { id } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    await this.cacheService.set(cacheKey, JSON.stringify(vehicle), this.cacheTtl);
    return vehicle;
  }

  async update(id: string, payload: UpdateVehicleDto) {
    const vehicle = await this.findById(id);
    const whereClauses: any[] = [];
    if (
      typeof payload.license_plate === 'string' ||
      typeof payload.renavam === 'string' ||
      typeof payload.chassis === 'string'
    ) {
      const fields = ['license_plate', 'renavam', 'chassis'] as const;

      for (const field of fields) {
        if (typeof payload[field] === 'string') {
          whereClauses.push({ [field]: payload[field] });
        }
      }
    }

    if (whereClauses.length > 0) {
      const duplicate = await this.vehiclesRepository.findOne({
        where: whereClauses,
      });

      if (duplicate && duplicate.id !== id) {
        throw new BadRequestException('Duplicate license plate, renavam or chassis');
      }
    }

    await this.vehiclesRepository.update(id, payload);
    await this.cacheService.delByPattern('vehicles:*');
    await this.cacheService.del(`vehicles:id:${id}`);
    const updated = await this.vehiclesRepository.findOne({
      where: { id },
    });
    await this.auditService.log('vehicle.updated', vehicle.created_by || 'system', updated);
    await this.rabbitMQService.publish('vehicle.updated', updated);
    await this.cacheService.set(
      `vehicles:id:${vehicle.id}`,
      JSON.stringify(updated),
      this.cacheTtl,
    );
    return updated;
  }

  async remove(id: string) {
    const vehicle = await this.findById(id);
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    await this.vehiclesRepository.remove(vehicle);
    await this.cacheService.delByPattern('vehicles:*');
    await this.cacheService.del(`vehicles:id:${id}`);
    await this.auditService.log('vehicle.deleted', vehicle.created_by || 'system', vehicle);
    await this.rabbitMQService.publish('vehicle.deleted', vehicle);
    return { success: true };
  }
}
