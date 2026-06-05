import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { AuthModule } from '../src/modules/auth/auth.module';
import { BrandsModule } from '../src/modules/brands/brands.module';
import { ModelsModule } from '../src/modules/models/models.module';
import { VehiclesModule } from '../src/modules/vehicles/vehicles.module';
import { HealthModule } from '../src/modules/health/health.module';
import { CacheModule } from '../src/shared/cache/cache.module';
import { AuditModule } from '../src/shared/audit/audit.module';
import { MessagingModule } from '../src/shared/messaging/messaging.module';
import { User } from '../src/modules/auth/entities/user.entity';
import { Brand } from '../src/modules/brands/entities/brand.entity';
import { VehicleModel } from '../src/modules/models/entities/vehicle-model.entity';
import { Vehicle } from '../src/modules/vehicles/entities/vehicle.entity';
import { RedisCacheService } from '../src/shared/cache/redis-cache.service';
import { AuditService } from '../src/shared/audit/audit.service';
import { RabbitMQService } from '../src/shared/messaging/rabbitmq.service';

const cacheMock = { get: jest.fn().mockResolvedValue(null), set: jest.fn(), del: jest.fn(), delByPattern: jest.fn() };
const auditMock = { log: jest.fn() };
const rabbitMock = { publish: jest.fn() };

describe('App e2e', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let brandRepository: Repository<Brand>;
  let modelRepository: Repository<VehicleModel>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [User, Brand, VehicleModel, Vehicle],
          synchronize: true,
        }),
        AuthModule,
        BrandsModule,
        ModelsModule,
        VehiclesModule,
        HealthModule,
        CacheModule,
        AuditModule,
        MessagingModule,
      ],
    })
      .overrideProvider(RedisCacheService)
      .useValue(cacheMock)
      .overrideProvider(AuditService)
      .useValue(auditMock)
      .overrideProvider(RabbitMQService)
      .useValue(rabbitMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, transformOptions: { enableImplicitConversion: true } }),
    );
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    brandRepository = moduleFixture.get<Repository<Brand>>(getRepositoryToken(Brand));
    modelRepository = moduleFixture.get<Repository<VehicleModel>>(getRepositoryToken(VehicleModel));

    const password_hash = await bcrypt.hash('aivacol123', 10);
    await userRepository.save({ nickname: 'aivacol', name: 'Aiva Col', email: 'aivacol@example.com', password_hash });
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1/health (GET)', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/health').expect(200);
    expect(response.body).toMatchObject({ success: true, status: 'ok' });
    expect(typeof response.body.timestamp).toBe('string');
  });

  it('/api/v1/auth/login (POST) should authenticate', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'aivacol@example.com', password: 'aivacol123' })
      .expect(201);

    expect(response.body).toHaveProperty('access_token');
  });

  it('should perform brand/model/vehicle CRUD', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'aivacol@example.com', password: 'aivacol123' });

    const token = loginResponse.body.access_token;

    const brandResponse = await request(app.getHttpServer())
      .post('/api/v1/brands')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'TestBrand', created_by: 'aivacol' })
      .expect(201);

    const brandId = brandResponse.body.data.id;

    const modelResponse = await request(app.getHttpServer())
      .post('/api/v1/models')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'TestModel', brand_id: brandId, created_by: 'aivacol' })
      .expect(201);

    const modelId = modelResponse.body.data.id;

    const vehicleResponse = await request(app.getHttpServer())
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({
        license_plate: 'AAA1A23',
        chassis: '9BWZZZ377VT000111',
        renavam: '12345678903',
        year: 2025,
        model_id: modelId,
        created_by: 'aivacol',
      })
      .expect(201);

    const vehicleId = vehicleResponse.body.data.id;

    await request(app.getHttpServer())
      .get('/api/v1/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/api/v1/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ year: 2026 })
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/api/v1/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
