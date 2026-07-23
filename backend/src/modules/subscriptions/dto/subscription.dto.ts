import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateTierContentDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    price?: number;

    @IsString()
    @IsOptional()
    tagline?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsArray()
    @IsOptional()
    features?: string[];

    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
}

export class CreateTierFeatureDto {
    @IsString()
    @IsNotEmpty()
    featureKey: string;

    @IsString()
    @IsNotEmpty()
    label: string;
}

export class SetTierFeatureDto {
    @IsBoolean()
    enabled: boolean;
}
