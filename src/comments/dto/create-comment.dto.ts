import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCommentDto {
    @IsNotEmpty()
    @IsString()
    comment_content: string;

    @IsNotEmpty()
    @IsUUID()
    comment_from_task: string;
}
