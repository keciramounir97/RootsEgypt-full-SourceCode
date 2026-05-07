import { IsBoolean, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateSettingsDto {
    @IsBoolean()
    @IsOptional()
    allowRegistration?: boolean;

    @IsIn(['en', 'fr', 'ar', 'es'])
    @IsOptional()
    defaultLanguage?: string;

    @IsBoolean()
    @IsOptional()
    notifyAdmins?: boolean;

    @IsInt()
    @Min(7)
    @Max(365)
    @IsOptional()
    activityRetentionDays?: number;
}
