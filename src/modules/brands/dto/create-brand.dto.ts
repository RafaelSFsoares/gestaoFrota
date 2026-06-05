import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({ example: 'Toyota' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'aivacol' })
  @IsString()
  @IsNotEmpty()
  created_by: string;
}
