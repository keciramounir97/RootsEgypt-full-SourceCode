export type StoredFilePayload = {
    data: Buffer;
    mimeType: string;
    filename: string;
};
export declare const toStoredBuffer: (value: unknown) => Buffer | null;
export declare const filenameFromStoredPath: (storedPath: unknown, fallback?: string) => string;
export declare const getStoredFilePayload: (row: Record<string, unknown> | null | undefined, dataKey: string, mimeKey: string, pathKey: string, fallbackMimeType?: string, fallbackFilename?: string) => StoredFilePayload | null;
