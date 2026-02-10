import { Controller, Post, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../auth/dto/login.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Ruta Pública: Login
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // Ruta Protegida: Logout
  // Requiere un Access Token válido para cerrar sesión
  @UseGuards(AuthGuard('jwt')) 
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: any) {
    const userId = req.user['sub'];
    return this.authService.logout(userId);
  }

  // Ruta Especial: Refresh
  // Requiere un REFRESH Token válido en el Header Authorization
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(@Req() req: any) {
    const userId = req.user['sub'];
    return this.authService.refreshTokens(userId);
  }
}