import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { ModelsService } from './models.service';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('models')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('models')
export class ModelsController {
  constructor(private readonly modelsService: ModelsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a model' })
  async create(@Body() payload: CreateModelDto) {
    const model = await this.modelsService.create(payload);
    return {
      success: true,
      message: 'Model created successfully',
      data: model,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List all models' })
  findAll() {
    return this.modelsService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.modelsService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: UpdateModelDto) {
    return this.modelsService.update(id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.modelsService.remove(id);
  }
}
