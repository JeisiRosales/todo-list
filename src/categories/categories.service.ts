import { Injectable, Inject, NotFoundException } from '@nestjs/common';
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
      INSERT INTO CATEGORIES(category_name, category_descrip, category_color)
      VALUES($1, $2, $3)
      RETURNING *;
      `;

    const result = await this.pool.query(query, [
      category_name,
      category_descrip,
      category_color,
    ]);

    return result.rows[0];
  }

  // Método para obtener todas las categorías
  async findAll() {
    const query = `SELECT * FROM CATEGORIES`;
    const result = await this.pool.query(query);
    return result.rows;
  }

  // Método para obtener una categoría específica por su ID
  async findOne(id: string) {
    const query = `SELECT * FROM CATEGORIES WHERE category_id = $1`;
    const result = await this.pool.query(query, [id]);
    if (result.rows.length === 0) {
      throw new NotFoundException(`Categoria con id ${id} no encontrada`);
    }
    return result.rows[0];
  }

  // Método para obtener las categorías no asociadas a una tarea específica
  async findNotAssociated(id: string) {
    const query = `
      SELECT category_id, category_name FROM CATEGORIES
      WHERE category_id NOT IN (
        SELECT category_id FROM TASK_CATEGORIES WHERE task_id = $1
      );
    `;
    const result = await this.pool.query(query, [id]);
    return result.rows;
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
      fields.push(`category_name = $${idx++} `);
      values.push(category_name);
    }
    if (category_descrip) {
      fields.push(`category_descrip = $${idx++} `);
      values.push(category_descrip);
    }
    if (category_color) {
      fields.push(`category_color = $${idx++} `);
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

    const result = await this.pool.query(query, values);
    if (result.rows.length === 0) {
      throw new NotFoundException(`Categoria con id ${id} no encontrada`);
    }
    return result.rows[0];
  }

  // Método para eliminar una categoría por su ID
  async remove(id: string) {
    const query = `DELETE FROM CATEGORIES WHERE category_id = $1 RETURNING * `;
    const result = await this.pool.query(query, [id]);
    if (result.rows.length === 0) {
      throw new NotFoundException(`Categoria con id ${id} no encontrada`);
    }
    return result.rows[0];
  }
}