import { Type } from 'class-transformer';
import { IsArray, IsIn, IsOptional, IsString, ValidateNested } from 'class-validator';

export const LEGAL_LOCALES = ['en', 'fr', 'ar', 'es'] as const;
export const LEGAL_SLUGS = ['terms', 'privacy', 'cookies'] as const;

export class LegalSectionDto {
    @IsString()
    heading: string;

    @IsString()
    body: string;
}

export class UpdateLegalDocumentDto {
    @IsIn(LEGAL_LOCALES)
    @IsOptional()
    locale?: string;

    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    intro?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LegalSectionDto)
    @IsOptional()
    sections?: LegalSectionDto[];
}
