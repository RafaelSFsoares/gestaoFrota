import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateModelDto {
  @ApiProperty({ example: 'Corolla' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'a9d1592d-8a6d-43e1-bf71-27ef31c4c815' })
  @IsUUID()
  brand_id: string;

  @ApiProperty({ example: 'aivacol' })
  @IsString()
  @IsNotEmpty()
  created_by: string;
}
