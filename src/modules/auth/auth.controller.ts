import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Autenticação de usuário' })
  @ApiResponse({ status: 201, description: 'Retorna token JWT.' })
  async login(@Body() body: LoginDto) {
    return this.authService.authenticate(body.email, body.password);
  }
}
