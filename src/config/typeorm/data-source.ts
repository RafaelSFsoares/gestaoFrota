import { DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'mssql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  username: process.env.DB_USERNAME || 'sa',
  password: process.env.DB_PASSWORD || 'YourStrong!Passw0rd',
  database: process.env.DB_DATABASE || 'gestao_frota_db',
  synchronize: process.env.TYPEORM_SYNC === 'true' || false,
  logging: false,
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../../../migrations/*{.ts,.js}'],
  options: {
    encrypt: false,
  },
};

export default dataSourceOptions;
