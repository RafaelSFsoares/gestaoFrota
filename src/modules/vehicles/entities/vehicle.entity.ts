import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'vehicles' })
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'license_plate', unique: true })
  license_plate: string;

  @Column({ unique: true })
  chassis: string;

  @Column({ unique: true })
  renavam: string;

  @Column()
  year: number;

  @Column({ name: 'model_id' })
  model_id: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @Column({ name: 'created_by', nullable: true })
  created_by: string;
}
