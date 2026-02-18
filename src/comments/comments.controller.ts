import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('comments')
@UseGuards(AuthGuard('jwt'))
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }

  // Crear un comentario
  @Post()
  create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
    const creatorId = req.user.userId || req.user.id || req.user.sub;
    const comment_date = new Date();
    return this.commentsService.create(createCommentDto, creatorId, comment_date);
  }

  // Obtener todos los comentarios
  @Get()
  findAll() {
    return this.commentsService.findAll();
  }

  // Obtener un comentario por ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  // Actualizar un comentario
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentsService.update(id, updateCommentDto);
  }

  // Eliminar un comentario
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentsService.remove(id);
  }
}
