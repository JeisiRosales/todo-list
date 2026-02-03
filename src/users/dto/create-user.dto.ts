import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  /*
    Verificamos que el campo del nombre del body sea un entero y no este vacio
  */ 
  @IsString()
  @IsNotEmpty()
  user_name: string; 

  /*
    Verificamos que el email venga en un formato correcto
  */
  @IsEmail({}, { message: 'El correo no es válido' })
  user_mail: string;

  /* 
    Validamos que el campo de password sea un string, y que tenga una capacidad minima de 6 caracteres
  */
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  user_password: string; // La clave antes de ser hasheada
}