import { IsUUID, IsNotEmpty, IsArray } from 'class-validator';

export class AssociateCategoryDto {
  @IsArray()
  @IsNotEmpty()
  @IsUUID('all', { each: true })
  categoryIds: string[];
}