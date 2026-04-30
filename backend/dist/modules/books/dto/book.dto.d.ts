export declare class CreateBookDto {
    title: string;
    description?: string;
    author?: string;
    category?: string;
    archiveSource?: string;
    documentCode?: string;
    publication_year?: string;
    isPublic?: boolean | string;
}
export declare class UpdateBookDto {
    title?: string;
    description?: string;
    author?: string;
    category?: string;
    archiveSource?: string;
    documentCode?: string;
    publication_year?: string;
    isPublic?: boolean | string;
}
