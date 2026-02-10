import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email no válido' })
  user_mail: string;

  @IsString()
  @MinLength(8)
  user_password: string;
}