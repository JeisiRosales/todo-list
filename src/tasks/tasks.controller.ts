import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssociateCategoryDto } from './dto/associate-category.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
export class TasksController {
  constructor(private readonly tasksService: TasksService) { }

  // Crear una tarea
  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    const creatorId = req.user.userId || req.user.id || req.user.sub;
    return this.tasksService.create(createTaskDto, creatorId);
  }

  // Asociar categorías a una tarea
  @Post(':id/categories')
  associateCategories(@Param('id') taskId: string, @Body() associateCategoryDto: AssociateCategoryDto) {
    return this.tasksService.associateCategories(taskId, associateCategoryDto.categoryIds);
  }

  // Obtener todas las tareas
  @Get()
  findAll(@Query('status') status: string, @Query('assignedTo') assignedTo: string, @Query('creatorId') creatorId: string) {
    return this.tasksService.findAll(status, assignedTo, creatorId);
  }

  // Obtener una tarea por id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  // Actualizar una tarea
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  // Eliminar una tarea
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
