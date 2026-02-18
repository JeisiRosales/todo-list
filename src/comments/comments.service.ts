import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Pool } from 'pg';

@Injectable()
export class CommentsService {
  constructor(@Inject('DATABASE_POOL') private pool: Pool) { }

  async create(createCommentDto: CreateCommentDto, creatorId: string, comment_date: Date) {
    const {
      comment_from_task,
      comment_content
    } = createCommentDto;

    const query = `
      INSERT INTO comments (comment_from_task, comment_creator, comment_content, comment_date) 
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [
      comment_from_task,
      creatorId,
      comment_content,
      comment_date
    ];

    const result = await this.pool.query(query, values);

    return {
      message: 'Comentario creado exitosamente',
      data: result.rows[0]
    };
  }

  async findAll() {
    const query = `
      SELECT * FROM comments
    `;

    const result = await this.pool.query(query);

    return {
      message: 'Comentarios obtenidos exitosamente',
      data: result.rows
    };
  }

  async findOne(id: string) {
    const query = `
      SELECT * FROM comments WHERE comment_id = $1
    `;

    const result = await this.pool.query(query, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Comentario con ID ${id} no encontrado`);
    }

    return {
      message: 'Comentario obtenido exitosamente',
      data: result.rows[0]
    };
  }

  async update(id: string, updateCommentDto: UpdateCommentDto) {
    const {
      comment_content
    } = updateCommentDto;

    const query = `
      UPDATE comments 
      SET comment_content = $2
      WHERE comment_id = $1
      RETURNING *
    `;

    const values = [
      id,
      comment_content
    ];

    const result = await this.pool.query(query, values);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Comentario con ID ${id} no encontrado`);
    }

    return {
      message: 'Comentario actualizado exitosamente',
      data: result.rows[0]
    };
  }

  async remove(id: string) {
    const query = `
      DELETE FROM comments WHERE comment_id = $1
      RETURNING *
    `;

    const result = await this.pool.query(query, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Comentario con ID ${id} no encontrado`);
    }

    return {
      message: 'Comentario eliminado exitosamente',
      data: result.rows[0]
    };
  }
}
