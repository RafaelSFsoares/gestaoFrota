import { VehiclesController } from '../vehicles.controller';
import { VehiclesService } from '../vehicles.service';

describe('VehiclesController', () => {
  let controller: VehiclesController;
  let service: jest.Mocked<VehiclesService>;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<VehiclesService>;
    controller = new VehiclesController(service);
  });

  it('should create a vehicle', async () => {
    const payload = {
      license_plate: 'ABC1D23',
      chassis: '9BWZZZ377VT004251',
      renavam: '12345678901',
      year: 2025,
      model_id: 'model-1',
      created_by: 'tester',
    };
    service.create.mockResolvedValue({
      id: '1',
      ...payload,
      updated_at: new Date(),
      created_at: new Date(),
    });
    const result = await controller.create(payload);
    expect(result).toMatchObject({ success: true });
    expect(result.message).toBeDefined();
    expect(result.data).toMatchObject({ id: '1', ...payload });
  });

  it('should call findAll with query params', async () => {
    const query = { page: 1, limit: 10 };
    service.findAll.mockResolvedValue({ data: [], total: 0 });
    await controller.findAll(query);
    expect(service.findAll).toHaveBeenCalledWith(query);
  });
});
