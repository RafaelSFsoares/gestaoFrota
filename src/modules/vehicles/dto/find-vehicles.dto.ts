import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class FindVehiclesDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ example: 'ABC1D23' })
  @IsOptional()
  @IsString()
  plate?: string;

  @ApiPropertyOptional({ example: 2025 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @ApiPropertyOptional({ example: 'a9d1592d-8a6d-43e1-bf71-27ef31c4c815' })
  @IsOptional()
  @IsUUID()
  model?: string;

  @ApiPropertyOptional({ example: 'created_at' })
  @IsOptional()
  @IsEnum(['license_plate', 'year', 'created_at'])
  sortBy?: 'license_plate' | 'year' | 'created_at';

  @ApiPropertyOptional({ example: 'DESC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC';
}
