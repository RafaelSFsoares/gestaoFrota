import { Controller, Post, Body, Get, Param, Patch, Delete, Query, UseGuards } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { FindVehiclesDto } from './dto/find-vehicles.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('vehicles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vehicles')
export class VehiclesController {
  constructor(private service: VehiclesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a vehicle' })
  async create(@Body() body: CreateVehicleDto) {
    const vehicle = await this.service.create(body);
    return {
      success: true,
      message: 'Vehicle created successfully',
      data: vehicle,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List vehicles with pagination and filters' })
  findAll(@Query() query: FindVehiclesDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a vehicle by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a vehicle' })
  update(@Param('id') id: string, @Body() body: UpdateVehicleDto) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a vehicle' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
