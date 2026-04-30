
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGalleryDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    archiveSource?: string;

    @IsString()
    @IsOptional()
    documentCode?: string;

    @IsString()
    @IsOptional()
    location?: string;

    @IsString()
    @IsOptional()
    year?: string;

    @IsString()
    @IsOptional()
    photographer?: string;

    @IsOptional()
    isPublic?: boolean | string;

    @IsOptional()
    bookId?: string | number;

    @IsOptional()
    treeId?: string | number;
}

export class UpdateGalleryDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    archiveSource?: string;

    @IsString()
    @IsOptional()
    documentCode?: string;

    @IsString()
    @IsOptional()
    location?: string;

    @IsString()
    @IsOptional()
    year?: string;

    @IsString()
    @IsOptional()
    photographer?: string;

    @IsOptional()
    bookId?: string | number;

    @IsOptional()
    treeId?: string | number;

    @IsOptional()
    isPublic?: boolean | string;
}
