import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ModelsService } from '../models.service';
import { Repository } from 'typeorm';
import { VehicleModel } from '../entities/vehicle-model.entity';

const mockRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('ModelsService', () => {
  let service: ModelsService;
  let repository: jest.Mocked<Repository<VehicleModel>>;

  beforeEach(() => {
    repository = mockRepository() as unknown as jest.Mocked<Repository<VehicleModel>>;
    service = new ModelsService(repository);
  });

  it('should create a model when not exists', async () => {
    repository.findOne.mockResolvedValue(null);
    repository.create.mockReturnValue({ id: '1', name: 'Model', brand_id: 'brand-1', created_at: new Date(), updated_at: new Date(), created_by: 'tester' });
    repository.save.mockResolvedValue({ id: '1', name: 'Model', brand_id: 'brand-1', created_at: new Date(), updated_at: new Date(), created_by: 'tester' });

    const result = await service.create({ name: 'Model', brand_id: 'brand-1', created_by: 'tester' });
    expect(result).toEqual({
      id: '1',
      name: 'Model',
      brand_id: 'brand-1',
      created_at: expect.any(Date),
      updated_at: expect.any(Date),
      created_by: 'tester',
    });
  });

  it('should throw when model already exists for the brand', async () => {
    repository.findOne.mockResolvedValue({ id: '1', name: 'Model', brand_id: 'brand-1', created_at: new Date(), updated_at: new Date(), created_by: 'tester' });
    await expect(service.create({ name: 'Model', brand_id: 'brand-1', created_by: 'tester' })).rejects.toThrow(BadRequestException);
  });

  it('should find all models', async () => {
    repository.find.mockResolvedValue([{ id: '1', name: 'Model', brand_id: 'brand-1', created_at: new Date(), updated_at: new Date(), created_by: 'tester' }]);
    const result = await service.findAll();
    expect(result).toEqual([
      {
        id: '1',
        name: 'Model',
        brand_id: 'brand-1',
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        created_by: 'tester',
      },
    ]);
  });

  it('should throw when findById missing', async () => {
    repository.findOne.mockResolvedValue(null);
    await expect(service.findById('1')).rejects.toThrow(NotFoundException);
  });
});
