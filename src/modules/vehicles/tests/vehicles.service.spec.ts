import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { VehiclesService } from '../vehicles.service';
import { Vehicle } from '../entities/vehicle.entity';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { RedisCacheService } from '../../../shared/cache/redis-cache.service';
import { AuditService } from '../../../shared/audit/audit.service';
import { RabbitMQService } from '../../../shared/messaging/rabbitmq.service';

const mockRepository = (): jest.Mocked<Repository<Vehicle>> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
} as unknown as jest.Mocked<Repository<Vehicle>>);

const mockCacheService = (): Partial<RedisCacheService> => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  delByPattern: jest.fn(),
});

const mockAuditService = (): Partial<AuditService> => ({
  log: jest.fn(),
});

const mockRabbitMQService = (): Partial<RabbitMQService> => ({
  publish: jest.fn(),
});

describe('VehiclesService', () => {
  let service: VehiclesService;
  let repository: jest.Mocked<Repository<Vehicle>>;
  let cacheService: Partial<RedisCacheService>;
  let auditService: Partial<AuditService>;
  let rabbitMQService: Partial<RabbitMQService>;

  beforeEach(() => {
    repository = mockRepository();
    cacheService = mockCacheService();
    auditService = mockAuditService();
    rabbitMQService = mockRabbitMQService();
    service = new VehiclesService(
      repository,
      cacheService as RedisCacheService,
      auditService as AuditService,
      rabbitMQService as RabbitMQService,
    );
  });

  it('should create a vehicle when data is valid and unique', async () => {
    (repository.findOne as jest.Mock).mockResolvedValue(null);
    (repository.create as jest.Mock).mockReturnValue({} as Vehicle);
    (repository.save as jest.Mock).mockResolvedValue({ id: '1' } as Vehicle);

    const payload: CreateVehicleDto = {
      license_plate: 'ABC1D23',
      chassis: '9BWZZZ377VT004251',
      renavam: '12345678901',
      year: 2025,
      model_id: 'model-uuid',
      created_by: 'aivacol',
    };

    const result = await service.create(payload);

    expect(repository.findOne).toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalled();
    expect(result).toEqual({ id: '1' });
  });

  it('should throw when duplicate vehicle exists', async () => {
    repository.findOne.mockResolvedValue({ id: '1' } as Vehicle);

    const payload: CreateVehicleDto = {
      license_plate: 'ABC1D23',
      chassis: '9BWZZZ377VT004251',
      renavam: '12345678901',
      year: 2025,
      model_id: 'model-uuid',
      created_by: 'aivacol',
    };

    await expect(service.create(payload)).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException when vehicle not found', async () => {
    repository.findOne.mockResolvedValue(null);
    await expect(service.findById('missing-id')).rejects.toThrow(NotFoundException);
  });
});
