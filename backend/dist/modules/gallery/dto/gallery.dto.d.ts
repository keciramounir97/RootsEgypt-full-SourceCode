export declare class CreateGalleryDto {
    title: string;
    description?: string;
    archiveSource?: string;
    documentCode?: string;
    location?: string;
    year?: string;
    photographer?: string;
    isPublic?: boolean | string;
    bookId?: string | number;
    treeId?: string | number;
}
export declare class UpdateGalleryDto {
    title?: string;
    description?: string;
    archiveSource?: string;
    documentCode?: string;
    location?: string;
    year?: string;
    photographer?: string;
    bookId?: string | number;
    treeId?: string | number;
    isPublic?: boolean | string;
}
