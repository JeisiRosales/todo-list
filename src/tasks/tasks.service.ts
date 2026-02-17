import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Pool } from 'pg';

@Injectable()
export class TasksService {
  constructor(@Inject('DATABASE_POOL') private pool: Pool) {}
    async create(createTaskDto: CreateTaskDto, creatorId: string) { // Cambiado a string por el UUID
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
      }; 
  }

  async findAll(status?: string, assignedTo?: string) {
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

    // Filtro por Usuario Asignado
    if (assignedTo) {
      values.push(assignedTo);
      query += ` AND t.task_asign_to = $${values.length}`;
    }

    query += ` ORDER BY t.task_delivery_date ASC`;

    const result = await this.pool.query(query, values);
    return result.rows;
  }

  findOne(id: string) {
    return `This action returns a #${id} task`;
  }

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

  remove(id: string) {
    return `This action removes a #${id} task`;
  }
  
  async associateCategory(taskId: string, categoryId: string) {
  try {
    const query = `
      INSERT INTO task_categories (task_id, category_id)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const result = await this.pool.query(query, [taskId, categoryId]);
    
    return {
      message: 'Categoría asociada a la tarea exitosamente',
    };
  } catch (error) {
    throw new BadRequestException('No se pudo asociar la categoría. Verifique que los IDs existan o que no estén ya asociados.');
  }
}
}
