import { Controller, Get, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @Version('1')
  @ApiOperation({ summary: 'Health check da API' })
  @ApiOkResponse({ description: 'API está em funcionamento' })
  check() {
    return {
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
