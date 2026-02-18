import { Injectable, Inject, BadRequestException, ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@Inject('DATABASE_POOL') private pool: Pool) { }

  // Funcion para el registro del usuario
  async create(createUserDto: CreateUserDto) {
    const { user_name, user_mail, user_password } = createUserDto;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user_password, salt);

    try {
      const query = `
        INSERT INTO USERS (user_name, user_mail, user_password)
        VALUES ($1, $2, $3)
        RETURNING user_id, user_name, user_mail;
      `;
      const res = await this.pool.query(query, [user_name, user_mail, hashedPassword]);
      return res.rows[0];
    } catch (error) {
      if (error.code === '23505') throw new ConflictException('Email ya registrado');
      throw new InternalServerErrorException('Error al crear usuario');
    }
  }

  // Buscar usuario por email para el login
  async findByEmailForAuth(email: string) {
    const query = 'SELECT * FROM USERS WHERE user_mail = $1';
    const res = await this.pool.query(query, [email]);
    return res.rows[0];
  }

  // Buscar usuarios por ID
  async findOne(id: string) {
    const query = 'SELECT user_id, user_name, user_mail FROM USERS WHERE user_id = $1';
    const res = await this.pool.query(query, [id]);

    if (res.rows.length === 0) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return res.rows[0];
  }

  // Funcion para actualizar parcialmente a un usuario
  async update(id: string, updateUserDto: UpdateUserDto) {
    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    // Recorremos el DTO filtrado (solo name y mail)
    for (const [key, value] of Object.entries(updateUserDto)) {
      if (value !== undefined && value !== null) {
        fields.push(`${key} = $${index}`);
        values.push(value);
        index++;
      }
    }

    // Si el body llegó vacío {}
    if (fields.length === 0) {
      throw new BadRequestException('Debe proporcionar al menos un campo para actualizar (nombre o email)');
    }

    // Añadimos el ID al final para la cláusula WHERE
    values.push(id);

    const query = `
    UPDATE USERS 
    SET ${fields.join(', ')} 
    WHERE user_id = $${index} 
    RETURNING user_id, user_name, user_mail;
  `;

    try {
      const res = await this.pool.query(query, values);

      if (res.rows.length === 0) {
        throw new NotFoundException('Usuario no encontrado');
      }

      return res.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('El correo ya está registrado por otro usuario');
      }
      throw new InternalServerErrorException('Error al actualizar el usuario');
    }
  }

  // Eliminar un usuario por ID
  async remove(id: string) {
    const query = `
      DELETE FROM USERS 
      WHERE user_id = $1 
      RETURNING user_id, user_name, user_mail;
    `;

    try {
      // Ejecutamos la consulta
      const res = await this.pool.query(query, [id]);

      // Si no se eliminó ninguna fila, lanzamos excepción
      if (res.rowCount === 0) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }

      // Retornamos mensaje y el usuario eliminado
      return {
        message: 'Usuario eliminado correctamente',
        deletedUser: res.rows[0]
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      // Capturamos violación de llave foránea
      if (error?.code === '23503') {
        throw new ConflictException('No se puede eliminar el usuario porque tiene tareas o datos asociados.');
      }
      throw new InternalServerErrorException('Error al eliminar usuario');
    }
  }
}
