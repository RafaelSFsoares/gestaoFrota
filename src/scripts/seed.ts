import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import { DataSource } from 'typeorm';
import dataSourceOptions from '../config/typeorm/data-source';
import * as bcrypt from 'bcrypt';
import { Brand } from '../modules/brands/entities/brand.entity';
import { VehicleModel } from '../modules/models/entities/vehicle-model.entity';
import { Vehicle } from '../modules/vehicles/entities/vehicle.entity';
import { User } from '../modules/auth/entities/user.entity';

const seedVehicles = JSON.parse(readFileSync(join(__dirname, '../../seed_vehicles.json'), 'utf8')) as {
  brands: Array<{ id: string; name: string; created_by: string | null }>;
  models: Array<{ id: string; name: string; brand_id: string; created_by: string | null }>;
  vehicles: Array<{ license_plate: string; chassis: string; renavam: string; year: number; model_id: string; created_by: string }>;
};

dotenv.config();

async function run() {
  const ds = new DataSource(dataSourceOptions);
  await ds.initialize();

  const userRepo = ds.getRepository(User);
  const brandRepo = ds.getRepository(Brand);
  const modelRepo = ds.getRepository(VehicleModel);
  const vehicleRepo = ds.getRepository(Vehicle);

  const password_hash = await bcrypt.hash('aivacol123', 10);
  const defaultUser = await userRepo.findOne({ where: { nickname: 'aivacol' } });

  if (!defaultUser) {
    await userRepo.insert({
      nickname: 'aivacol',
      name: 'Aiva Col',
      email: 'aivacol@example.com',
      password_hash,
    });
    console.log('Default user created: aivacol');
  } else {
    console.log('Default user exists');
  }

  for (const brandData of seedVehicles.brands) {
    const exists = await brandRepo.findOne({ where: { name: brandData.name } });
    if (!exists) {
      const insertPayload: Partial<Brand> = brandData.created_by
        ? { id: brandData.id, name: brandData.name, created_by: brandData.created_by }
        : { id: brandData.id, name: brandData.name };
      await brandRepo.insert(insertPayload);
      console.log(`Brand seeded: ${brandData.name}`);
    }
  }

  for (const modelData of seedVehicles.models) {
    const exists = await modelRepo.findOne({ where: { name: modelData.name, brand_id: modelData.brand_id } });
    if (!exists) {
      const insertPayload: Partial<VehicleModel> = modelData.created_by
        ? { id: modelData.id, name: modelData.name, brand_id: modelData.brand_id, created_by: modelData.created_by }
        : { id: modelData.id, name: modelData.name, brand_id: modelData.brand_id };
      await modelRepo.insert(insertPayload);
      console.log(`Model seeded: ${modelData.name}`);
    }
  }

  for (const vehicleData of seedVehicles.vehicles) {
    const exists = await vehicleRepo.findOne({ where: { license_plate: vehicleData.license_plate } });
    if (!exists) {
      await vehicleRepo.insert(vehicleData);
      console.log(`Vehicle seeded: ${vehicleData.license_plate}`);
    }
  }

  await ds.destroy();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
