import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Pool } from 'pg';

@Injectable()
export class TasksService {
  constructor(@Inject('DATABASE_POOL') private pool: Pool) { }

  // Método para crear una nueva tarea
  async create(createTaskDto: CreateTaskDto, creatorId: string) {
    const {
      task_name,
      task_descrip,
      task_story_points,
      task_delivery_date,
      task_asign_to
    } = createTaskDto;

    if (task_story_points !== undefined && task_story_points < 0) {
      throw new BadRequestException('Los story points no pueden ser negativos');
    }

    const query = `
      INSERT INTO tasks (
        task_name, 
        task_descrip, 
        task_story_points, 
        task_delivery_date, 
        task_creator, 
        task_asign_to, 
        task_status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'Pendiente')
      RETURNING *;
    `;

    const values = [
      task_name,
      task_descrip || null,
      task_story_points || 0,
      task_delivery_date || null,
      creatorId,
      task_asign_to
    ];

    const result = await this.pool.query(query, values);

    return {
      message: `Tarea creada exitosamente por el usuario ID: ${creatorId}`,
      data: result.rows[0],
    };
  }

  // Método para asociar una categoría a una tarea
  async associateCategories(taskId: string, categoryIds: string[]) {
    const query = `
        INSERT INTO task_categories (task_id, category_id)
        SELECT $1, unnest($2::uuid[])
        ON CONFLICT DO NOTHING
        RETURNING *;
      `;

    const result = await this.pool.query(query, [taskId, categoryIds]);

    return {
      message: 'Categorías asociadas a la tarea exitosamente',
      data: result.rows,
    };
  }

  // Método para obtener todas las tareas
  async findAll(status?: string, assignedTo?: string, creatorId?: string) {
    let query = `
      SELECT t.*, u.user_name as assigned_user_name
      FROM tasks t
      LEFT JOIN users u ON t.task_asign_to = u.user_id
      WHERE 1=1
    `;
    const values: any[] = [];

    // Filtro por Estado
    if (status) {
      values.push(status);
      query += ` AND t.task_status = $${values.length}`;
    }

    // Filtro por Usuario Creador
    if (creatorId) {
      values.push(creatorId);
      query += ` AND t.task_creator = $${values.length}`;
    }

    // Filtro por Usuario Asignado
    if (assignedTo) {
      values.push(assignedTo);
      query += ` AND t.task_asign_to = $${values.length}`;
    }

    query += ` ORDER BY t.task_delivery_date ASC`;

    const result = await this.pool.query(query, values);
    return result.rows;
  }

  // Metodo para encontrar una tarea por su ID
  async findOne(id: string) {
    const query = `
      SELECT t.*
      FROM tasks t
      WHERE t.task_id = $1;
    `;
    const result = await this.pool.query(query, [id]);
    if (result.rows.length === 0) {
      throw new NotFoundException(`No se encontró la tarea con ID: ${id}`);
    }
    return result.rows[0];
  }

  // Metodo para actualizar una tarea
  async update(id: string, updateTaskDto: UpdateTaskDto) {
    // Extraemos solo los campos que el proyecto permite editar
    const {
      task_name,
      task_descrip,
      task_story_points,
      task_delivery_date,
      task_status,
      task_asign_to
    } = updateTaskDto as any;

    // Validación de Story Points
    if (task_story_points !== undefined && task_story_points < 0) {
      throw new BadRequestException('Los story points no pueden ser negativos');
    }

    const query = `
      UPDATE tasks 
      SET 
        task_name = COALESCE($1, task_name),
        task_descrip = COALESCE($2, task_descrip),
        task_story_points = COALESCE($3, task_story_points),
        task_delivery_date = COALESCE($4, task_delivery_date),
        task_status = COALESCE($5, task_status),
        task_asign_to = COALESCE($6, task_asign_to)
      WHERE task_id = $7
      RETURNING *;
    `;

    const values = [
      task_name ?? null,
      task_descrip ?? null,
      task_story_points ?? null,
      task_delivery_date ?? null,
      task_status ?? null,
      task_asign_to ?? null,
      id
    ];

    const result = await this.pool.query(query, values);

    if (result.rows.length === 0) {
      throw new NotFoundException(`No se encontró la tarea con ID: ${id}`);
    }

    return {
      message: 'Tarea actualizada correctamente',
      data: result.rows[0]
    };
  }

  // Metodo para eliminar una tarea
  async remove(id: string) {
    const query = `
      DELETE FROM tasks 
      WHERE task_id = $1
      RETURNING *;
    `;
    const result = await this.pool.query(query, [id]);
    if (result.rows.length === 0) {
      throw new NotFoundException(`No se encontró la tarea con ID: ${id}`);
    }
    return {
      message: 'Tarea eliminada correctamente',
      data: result.rows[0]
    };
  }
}
