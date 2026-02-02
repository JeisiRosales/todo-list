import { IsNotEmpty, IsString, Matches } from "class-validator";

export class CreateCategoryDto {
    @IsString()
    @IsNotEmpty()
    category_name: string;

    @IsString()
    @IsNotEmpty()
    category_descrip: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^[a-fA-F0-9]{6}$/)
    category_color: string;
}
