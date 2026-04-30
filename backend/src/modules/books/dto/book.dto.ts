
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBookDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    author?: string;

    @IsString()
    @IsOptional()
    category?: string;

    @IsString()
    @IsOptional()
    archiveSource?: string;

    @IsString()
    @IsOptional()
    documentCode?: string;

    @IsString()
    @IsOptional()
    publication_year?: string;

    @IsOptional()
    isPublic?: boolean | string;
}

export class UpdateBookDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    author?: string;

    @IsString()
    @IsOptional()
    category?: string;

    @IsString()
    @IsOptional()
    archiveSource?: string;

    @IsString()
    @IsOptional()
    documentCode?: string;

    @IsString()
    @IsOptional()
    publication_year?: string;

    @IsOptional()
    isPublic?: boolean | string;
}
