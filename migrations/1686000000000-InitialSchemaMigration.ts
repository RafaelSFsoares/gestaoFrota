import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchemaMigration1686000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        id uniqueidentifier DEFAULT NEWID() PRIMARY KEY,
        nickname nvarchar(100) NOT NULL UNIQUE,
        name nvarchar(255) NOT NULL,
        email nvarchar(255) NOT NULL UNIQUE,
        password_hash nvarchar(255) NOT NULL,
        created_at datetime2 DEFAULT GETDATE(),
        updated_at datetime2 DEFAULT GETDATE()
      );

      CREATE TABLE brands (
        id uniqueidentifier DEFAULT NEWID() PRIMARY KEY,
        name nvarchar(255) NOT NULL,
        created_at datetime2 DEFAULT GETDATE(),
        updated_at datetime2 DEFAULT GETDATE(),
        created_by uniqueidentifier NULL
      );

      CREATE TABLE models (
        id uniqueidentifier DEFAULT NEWID() PRIMARY KEY,
        name nvarchar(255) NOT NULL,
        brand_id uniqueidentifier NOT NULL,
        created_at datetime2 DEFAULT GETDATE(),
        updated_at datetime2 DEFAULT GETDATE(),
        created_by uniqueidentifier NULL
      );

      CREATE TABLE vehicles (
        id uniqueidentifier DEFAULT NEWID() PRIMARY KEY,
        license_plate nvarchar(20) NOT NULL UNIQUE,
        chassis nvarchar(20) NOT NULL UNIQUE,
        renavam nvarchar(50) NOT NULL UNIQUE,
        year int NOT NULL,
        model_id uniqueidentifier NOT NULL,
        created_at datetime2 DEFAULT GETDATE(),
        updated_at datetime2 DEFAULT GETDATE(),
        created_by uniqueidentifier NULL
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS vehicles; DROP TABLE IF EXISTS models; DROP TABLE IF EXISTS brands; DROP TABLE IF EXISTS users;`);
  }
}
