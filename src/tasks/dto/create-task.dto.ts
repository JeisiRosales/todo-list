import { IsString, IsOptional, IsInt, IsUUID, IsNotEmpty } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  task_name: string;

  @IsString()
  @IsOptional()
  task_descrip?: string;

  @IsInt()
  @IsOptional()
  task_story_points?: number;

  @IsString()
  @IsOptional()
  task_delivery_date?: string;

  @IsString()
  @IsOptional()
  task_status?: string;

  @IsUUID() 
  @IsNotEmpty()
  task_asign_to: string;
}