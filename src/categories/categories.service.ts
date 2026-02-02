import {
  Injectable,
  Inject,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Pool } from 'pg';

@Injectable()
export class CategoriesService {
  constructor(@Inject('DATABASE_POOL') private pool: Pool) { }

  // Método para crear una nueva categoría
  async create(createCategoryDto: CreateCategoryDto) {
    const { category_name, category_descrip, category_color } =
      createCategoryDto;

    const query = `
      INSERT INTO CATEGORIES (category_name, category_descrip, category_color)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    try {
      const result = await this.pool.query(query, [
        category_name,
        category_descrip,
        category_color,
      ]);

      return result.rows[0];
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  // Método para obtener todas las categorías
  async findAll() {
    const query = `SELECT * FROM CATEGORIES`;
    try {
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  // Método para obtener una categoría específica por su ID
  async findOne(id: string) {
    const query = `SELECT * FROM CATEGORIES WHERE category_id = $1`;
    try {
      const result = await this.pool.query(query, [id]);
      if (result.rows.length === 0) {
        throw new NotFoundException(`Categoria con id ${id} no encontrada`);
      }
      return result.rows[0];
    } catch (error) {
      // Si el error ya es una instancia de una excepción HTTP, la re-lanzamos
      if (error instanceof NotFoundException) throw error;
      this.handleDBExceptions(error);
    }
  }

  // Método para actualizar una categoría existente
  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const { category_name, category_descrip, category_color } =
      updateCategoryDto;

    // Construcción dinámica de la consulta UPDATE
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (category_name) {
      fields.push(`category_name = $${idx++}`);
      values.push(category_name);
    }
    if (category_descrip) {
      fields.push(`category_descrip = $${idx++}`);
      values.push(category_descrip);
    }
    if (category_color) {
      fields.push(`category_color = $${idx++}`);
      values.push(category_color);
    }

    // Si no hay campos para actualizar, verificamos si existe y la devolvemos
    if (fields.length === 0) return this.findOne(id);

    values.push(id);
    const query = `
      UPDATE CATEGORIES
      SET ${fields.join(', ')}
      WHERE category_id = $${idx}
      RETURNING *;
    `;

    try {
      const result = await this.pool.query(query, values);
      if (result.rows.length === 0) {
        throw new NotFoundException(`Categoria con id ${id} no encontrada`);
      }
      return result.rows[0];
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDBExceptions(error);
    }
  }

  // Método para eliminar una categoría por su ID
  async remove(id: string) {
    const query = `DELETE FROM CATEGORIES WHERE category_id = $1 RETURNING *`;
    try {
      const result = await this.pool.query(query, [id]);
      if (result.rows.length === 0) {
        throw new NotFoundException(`Categoria con id ${id} no encontrada`);
      }
      return result.rows[0];
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDBExceptions(error);
    }
  }

  // Manejador centralizado de errores de base de datos
  private handleDBExceptions(error: any) {
    console.error(error);

    // Código de error de Postgres para violación de unique constraint
    if (error.code === '23505') {
      throw new ConflictException(error.detail);
    }

    // Código para sintaxis de input inválido (ej. UUID mal formado)
    if (error.code === '22P02') {
      throw new BadRequestException('Formato de dato inválido (ej. UUID erróneo)');
    }

    // Código para violación de restricción NOT NULL (aunque DTO debería atraparlo)
    if (error.code === '23502') {
      throw new BadRequestException(`Falta el campo requerido: ${error.column}`);
    }

    // Código para valor demasiado largo para la columna (VARCHAR)
    if (error.code === '22001') {
      throw new BadRequestException('Valor demasiado largo para el campo');
    }

    // Cualquier otro error será un 500
    throw new InternalServerErrorException('Error inesperado, revisar logs del servidor');
  }
}
