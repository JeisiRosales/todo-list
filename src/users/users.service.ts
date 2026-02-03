import { Injectable, Inject, ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@Inject('DATABASE_POOL') private pool: Pool) {}

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

  // BUSCAR PARA LOGIN (Necesitamos la contraseña para comparar)
  async findByEmailForAuth(email: string) {
    const query = 'SELECT * FROM USERS WHERE user_mail = $1';
    const res = await this.pool.query(query, [email]);
    return res.rows[0]; 
  }
   
  // BUSCAR POR ID (Para ver perfil o validar sesión)
  async findOne(id: string) {
    const query = 'SELECT user_id, user_name, user_mail FROM USERS WHERE user_id = $1';
    const res = await this.pool.query(query, [id]);
    
    if (res.rows.length === 0) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return res.rows[0];
  }

  async findAll() {
    const query = 'SELECT user_id, user_name, user_mail FROM USERS';
    const res = await this.pool.query(query);

    return res.rows;
  }catch ( error){
    throw new InternalServerErrorException('Error al obtener usuarios');
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
