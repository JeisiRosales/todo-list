import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from '../auth/dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  // --- LOGIN ---
  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailForAuth(dto.user_mail);

    if (!user || !(await bcrypt.compare(dto.user_password, user.user_password))) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const tokens = await this.getTokens(user.user_id, user.user_mail);
    return tokens;
  }

  // --- LOGOUT ---
  async logout(userId: string) {
    //Por desarrollar
    return { message: 'Sesión cerrada correctamente' };
  }

  // --- REFRESH TOKEN ---
  async refreshTokens(userId: string) {
    // 1. Verificamos que el usuario aún exista en la DB (por seguridad)
    const user = await this.usersService.findOne(userId);
    if (!user) throw new ForbiddenException('Acceso Denegado: Usuario no encontrado');

    // 2. Generamos NUEVOS tokens
    const tokens = await this.getTokens(user.user_id, user.user_mail);
    return tokens;
  }

  // --- GENERADOR DE TOKENS (Helper) ---
  async getTokens(userId: string, email: string) {
    const [at, rt] = await Promise.all([
      // Access Token (Corto)
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.config.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '15m',
        },
      ),
      // Refresh Token (Largo)
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.config.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }
}