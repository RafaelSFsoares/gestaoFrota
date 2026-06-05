import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users.service';
import { User } from '../entities/user.entity';

const mockUsersService = () => ({
  findByEmail: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn().mockReturnValue('jwt-token'),
});

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { findByEmail: jest.Mock<Promise<User | null>, [string]> };
  let jwtService: { sign: jest.Mock<string, [unknown]> };

  beforeEach(() => {
    usersService = mockUsersService() as unknown as { findByEmail: jest.Mock<Promise<User | null>, [string]> };
    jwtService = mockJwtService() as unknown as { sign: jest.Mock<string, [unknown]> };
    service = new AuthService(usersService as unknown as UsersService, jwtService as unknown as JwtService);
  });

  it('should return user when credentials are valid', async () => {
    const password_hash = await bcrypt.hash('password', 10);
    const user: Partial<User> = { id: '1', email: 'test@example.com', password_hash, nickname: 'test' };
    usersService.findByEmail.mockResolvedValue(user as User);

    const result = await service.validateUser('test@example.com', 'password');
    expect(result).toEqual(user);
  });

  it('should return null when email not found', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    const result = await service.validateUser('nope@example.com', 'password');
    expect(result).toBeNull();
  });

  it('should throw UnauthorizedException on invalid authenticate', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    await expect(service.authenticate('invalid@example.com', 'password')).rejects.toThrow(UnauthorizedException);
  });

  it('should return an access token when login is successful', async () => {
    const user: Partial<User> = { id: '1', email: 'test@example.com', nickname: 'test' };
    const result = await service.login(user as User);
    expect(result).toEqual({ access_token: 'jwt-token' });
    expect(jwtService.sign).toHaveBeenCalledWith({ sub: user.id, email: user.email, nickname: user.nickname });
  });
});
