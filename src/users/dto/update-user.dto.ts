import { IsEmail, IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  user_name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email no válido' })
  user_mail?: string;
}