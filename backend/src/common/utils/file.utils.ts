import * as path from 'path';
import * as fs from 'fs';

// Define paths relative to project root (backend)
// logic: backend/src/common/utils -> backend/uploads (so ../../../uploads)
export const UPLOADS_DIR = path.join(__dirname, '..', '..', '..', 'uploads');
export const BOOK_UPLOADS_DIR = path.join(UPLOADS_DIR, 'books');
export const TREE_UPLOADS_DIR = path.join(UPLOADS_DIR, 'trees');
export const GALLERY_UPLOADS_DIR = path.join(UPLOADS_DIR, 'gallery');
export const SITE_UPLOADS_DIR = path.join(UPLOADS_DIR, 'site');

export const PRIVATE_UPLOADS_DIR = path.join(__dirname, '..', '..', '..', 'private_uploads');
export const PRIVATE_BOOK_UPLOADS_DIR = path.join(PRIVATE_UPLOADS_DIR, 'books');
export const PRIVATE_TREE_UPLOADS_DIR = path.join(PRIVATE_UPLOADS_DIR, 'trees');

// Ensure directories exist
[
    BOOK_UPLOADS_DIR,
    TREE_UPLOADS_DIR,
    GALLERY_UPLOADS_DIR,
    SITE_UPLOADS_DIR,
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

export const resolveExistingStoredFilePath = (storedPath: string): string | null => {
    const rel = String(storedPath || '').trim();
    if (!rel) return null;

    const withoutLeadingSlash = rel.replace(/^\//, '');
    const uploadRelative = withoutLeadingSlash.replace(/^uploads\/?/, '');
    const privateRelative = withoutLeadingSlash.replace(/^private\/?/, '');
    const candidates = new Set<string>();

    const add = (candidate?: string | null) => {
        if (candidate) candidates.add(path.normalize(candidate));
    };

    add(resolveStoredFilePath(rel));
    if (path.isAbsolute(rel)) add(rel);

    const configuredUploads = process.env.UPLOADS_DIR || process.env.ROOTS_UPLOADS_DIR;
    if (configuredUploads) {
        if (rel.startsWith('/uploads/') || withoutLeadingSlash.startsWith('uploads/')) {
            add(path.join(configuredUploads, uploadRelative));
        } else if (withoutLeadingSlash.startsWith('private/')) {
            add(path.join(path.dirname(configuredUploads), 'private_uploads', privateRelative));
        }
    }

    for (const base of [
        path.join(process.cwd(), 'uploads'),
        path.join(process.cwd(), '..', 'uploads'),
        path.join(process.cwd(), 'public', 'uploads'),
        path.join(process.cwd(), '..', 'public_html', 'uploads'),
    ]) {
        if (rel.startsWith('/uploads/') || withoutLeadingSlash.startsWith('uploads/')) {
            add(path.join(base, uploadRelative));
        }
    }

    for (const base of [
        path.join(process.cwd(), 'private_uploads'),
        path.join(process.cwd(), '..', 'private_uploads'),
    ]) {
        if (withoutLeadingSlash.startsWith('private/')) {
            add(path.join(base, privateRelative));
        }
    }

    for (const candidate of candidates) {
        try {
            if (fs.existsSync(candidate)) return candidate;
        } catch {
            // Try the next candidate.
        }
    }

    return resolveStoredFilePath(rel);
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
