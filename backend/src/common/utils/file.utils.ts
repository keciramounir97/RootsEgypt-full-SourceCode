import * as path from 'path';
import * as fs from 'fs';

// Define paths relative to project root (backend)
// logic: backend/src/common/utils -> backend/uploads (so ../../../uploads)
export const UPLOADS_DIR = path.join(__dirname, '..', '..', '..', 'uploads');
export const BOOK_UPLOADS_DIR = path.join(UPLOADS_DIR, 'books');
export const TREE_UPLOADS_DIR = path.join(UPLOADS_DIR, 'trees');
export const GALLERY_UPLOADS_DIR = path.join(UPLOADS_DIR, 'gallery');

export const PRIVATE_UPLOADS_DIR = path.join(__dirname, '..', '..', '..', 'private_uploads');
export const PRIVATE_BOOK_UPLOADS_DIR = path.join(PRIVATE_UPLOADS_DIR, 'books');
export const PRIVATE_TREE_UPLOADS_DIR = path.join(PRIVATE_UPLOADS_DIR, 'trees');

// Ensure directories exist
[
    BOOK_UPLOADS_DIR,
    TREE_UPLOADS_DIR,
    GALLERY_UPLOADS_DIR,
    PRIVATE_BOOK_UPLOADS_DIR,
    PRIVATE_TREE_UPLOADS_DIR,
].forEach((dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

export const resolveStoredFilePath = (storedPath: string): string | null => {
    const rel = String(storedPath || '').trim();
    if (!rel) return null;

    if (rel.startsWith('/uploads/')) {
        const relative = rel.replace(/^\/uploads\/?/, '');
        return path.join(UPLOADS_DIR, relative);
    }
    if (rel.startsWith('private/')) {
        const relative = rel.replace(/^private\/?/, '');
        return path.join(PRIVATE_UPLOADS_DIR, relative);
    }
    if (path.isAbsolute(rel)) return rel;
    return path.join(path.dirname(UPLOADS_DIR), rel.replace(/^\//, ''));
};

export const safeUnlink = (filePath: string) => {
    if (!filePath) return;
    try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (err) {
        console.error('Safe unlink failed', err);
    }
};

export const safeMoveFile = (src: string, dest: string) => {
    try {
        // Ensure dest dir exists
        const destDir = path.dirname(dest);
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

        fs.renameSync(src, dest);
    } catch (e) {
        try {
            fs.copyFileSync(src, dest);
            safeUnlink(src);
        } catch (err) {
            console.error('Safe move failed', err);
        }
    }
};
