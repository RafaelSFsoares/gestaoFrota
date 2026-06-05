import { UsersService } from '../users.service';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

const mockRepository = () => ({
  findOne: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  beforeEach(() => {
    repository = mockRepository() as unknown as jest.Mocked<Repository<User>>;
    service = new UsersService(repository);
  });

  it('should find user by email', async () => {
    repository.findOne.mockResolvedValue({ id: '1', email: 'test@example.com', nickname: 'test', name: 'Test', password_hash: 'hash', created_at: new Date(), updated_at: new Date() } as User);
    const result = await service.findByEmail('test@example.com');
    expect(repository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    expect(result).toEqual({
      id: '1',
      email: 'test@example.com',
      nickname: 'test',
      name: 'Test',
      password_hash: 'hash',
      created_at: expect.any(Date),
      updated_at: expect.any(Date),
    });
  });

  it('should find user by nickname', async () => {
    repository.findOne.mockResolvedValue({ id: '1', nickname: 'test', name: 'Test', email: 'test@example.com', password_hash: 'hash', created_at: new Date(), updated_at: new Date() } as User);
    const result = await service.findByNickname('test');
    expect(repository.findOne).toHaveBeenCalledWith({ where: { nickname: 'test' } });
    expect(result).toEqual({
      id: '1',
      nickname: 'test',
      name: 'Test',
      email: 'test@example.com',
      password_hash: 'hash',
      created_at: expect.any(Date),
      updated_at: expect.any(Date),
    });
  });
});
