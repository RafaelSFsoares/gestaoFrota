import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BrandsService } from '../brands.service';
import { Repository } from 'typeorm';
import { Brand } from '../entities/brand.entity';

const mockRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('BrandsService', () => {
  let service: BrandsService;
  let repository: jest.Mocked<Repository<Brand>>;

  beforeEach(() => {
    repository = mockRepository() as unknown as jest.Mocked<Repository<Brand>>;
    service = new BrandsService(repository);
  });

  it('should create a brand when not exists', async () => {
    repository.findOne.mockResolvedValue(null);
    repository.create.mockReturnValue({ id: '1', name: 'Test', created_at: new Date(), updated_at: new Date(), created_by: 'tester' });
    repository.save.mockResolvedValue({ id: '1', name: 'Test', created_at: new Date(), updated_at: new Date(), created_by: 'tester' });

    const result = await service.create({ name: 'Test', created_by: 'tester' });
    expect(result).toMatchObject({ id: '1', name: 'Test' });
  });

  it('should throw when brand already exists', async () => {
    repository.findOne.mockResolvedValue({ id: '1', name: 'Test', created_at: new Date(), updated_at: new Date(), created_by: 'tester' });
    await expect(service.create({ name: 'Test', created_by: 'tester' })).rejects.toThrow(BadRequestException);
  });

  it('should find all brands', async () => {
    repository.find.mockResolvedValue([
      { id: '1', name: 'Test', created_at: new Date(), updated_at: new Date(), created_by: 'tester' },
    ]);
    const result = await service.findAll();
    expect(result).toEqual([
      { id: '1', name: 'Test', created_at: expect.any(Date), updated_at: expect.any(Date), created_by: 'tester' },
    ]);
  });

  it('should throw when findById missing', async () => {
    repository.findOne.mockResolvedValue(null);
    await expect(service.findById('1')).rejects.toThrow(NotFoundException);
  });
});
