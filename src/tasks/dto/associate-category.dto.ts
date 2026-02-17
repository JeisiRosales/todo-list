import { IsUUID, IsNotEmpty } from 'class-validator';

export class AssociateCategoryDto {
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;
}