import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';

describe('CreateVehicleDto', () => {
  it('should validate successfully with correct payload', async () => {
    const dto = plainToInstance(CreateVehicleDto, {
      license_plate: 'ABC1D23',
      chassis: '9BWZZZ377VT004251',
      renavam: '12345678901',
      year: new Date().getFullYear(),
      model_id: '1d0a0f7d-9b4a-4bca-9d34-37e70e30b84e',
      created_by: 'aivacol',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject invalid license plate and chassis', async () => {
    const dto = plainToInstance(CreateVehicleDto, {
      license_plate: 'INVALID',
      chassis: 'SHORT',
      renavam: 'ABC123',
      year: 1800,
      model_id: 'not-a-uuid',
      created_by: '',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['license_plate', 'chassis', 'renavam', 'year', 'model_id', 'created_by']),
    );
  });
});
