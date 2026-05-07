import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';

const SUGGESTION_TYPES = [
    'audio_category',
    'image_category',
    'book_category',
    'document_category',
    'article_category',
    'tree_category',
    'content',
] as const;

export class CreateSuggestionDto {
    @IsString()
    @IsIn(SUGGESTION_TYPES)
    type: string;

    @IsString()
    @IsOptional()
    category?: string;

    @IsString()
    @IsOptional()
    contentTitle?: string;

    @IsString()
    @IsOptional()
    userName?: string;

    @IsEmail()
    @IsOptional()
    userEmail?: string;

    @IsString()
    @IsOptional()
    userPhone?: string;

    @IsString()
    @IsOptional()
    message?: string;
}
