import { IsIn, IsInt } from 'class-validator';

export const DOWNLOAD_CONTENT_TYPES = ['tree', 'book', 'gallery', 'audio', 'document'] as const;
export type DownloadContentType = (typeof DOWNLOAD_CONTENT_TYPES)[number];

export class CreateDownloadRequestDto {
    @IsIn(DOWNLOAD_CONTENT_TYPES)
    contentType: DownloadContentType;

    @IsInt()
    contentId: number;
}
