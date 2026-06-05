import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches, IsInt, Min, Max, IsUUID } from 'class-validator';

const currentYear = new Date().getFullYear();

export class CreateVehicleDto {
  @ApiProperty({ example: 'ABC1D25' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Z]{3}[0-9][A-Z][0-9]{2}$/, {
    message: 'license_plate must match Mercosul format like ABC1D23',
  })
  license_plate: string;

  @ApiProperty({ example: '9BWZZZ377VT004000' })
  @IsNotEmpty()
  @IsString()
  @Length(17, 17, { message: 'chassis must contain exactly 17 characters' })
  chassis: string;

  @ApiProperty({ example: '12345678900' })
  @IsNotEmpty()
  @Matches(/^[0-9]+$/, { message: 'renavam must contain only numbers' })
  renavam: string;

  @ApiProperty({ example: 2025 })
  @IsInt()
  @Min(1900)
  @Max(currentYear + 1)
  year: number;

  @ApiProperty({ example: '6dd06591-8234-4c14-9c93-f91e39d2d1bb' })
  @IsUUID()
  model_id: string;

  @ApiProperty({ example: 'aivacol' })
  @IsString()
  @IsNotEmpty()
  created_by: string;
}
