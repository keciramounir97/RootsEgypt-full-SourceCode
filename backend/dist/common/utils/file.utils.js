"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeMoveFile = exports.safeUnlink = exports.resolveStoredFilePath = exports.PRIVATE_TREE_UPLOADS_DIR = exports.PRIVATE_BOOK_UPLOADS_DIR = exports.PRIVATE_UPLOADS_DIR = exports.GALLERY_UPLOADS_DIR = exports.TREE_UPLOADS_DIR = exports.BOOK_UPLOADS_DIR = exports.UPLOADS_DIR = void 0;
const path = require("path");
const fs = require("fs");
exports.UPLOADS_DIR = path.join(__dirname, '..', '..', '..', 'uploads');
exports.BOOK_UPLOADS_DIR = path.join(exports.UPLOADS_DIR, 'books');
exports.TREE_UPLOADS_DIR = path.join(exports.UPLOADS_DIR, 'trees');
exports.GALLERY_UPLOADS_DIR = path.join(exports.UPLOADS_DIR, 'gallery');
exports.PRIVATE_UPLOADS_DIR = path.join(__dirname, '..', '..', '..', 'private_uploads');
exports.PRIVATE_BOOK_UPLOADS_DIR = path.join(exports.PRIVATE_UPLOADS_DIR, 'books');
exports.PRIVATE_TREE_UPLOADS_DIR = path.join(exports.PRIVATE_UPLOADS_DIR, 'trees');
[
    exports.BOOK_UPLOADS_DIR,
    exports.TREE_UPLOADS_DIR,
    exports.GALLERY_UPLOADS_DIR,
    exports.PRIVATE_BOOK_UPLOADS_DIR,
    exports.PRIVATE_TREE_UPLOADS_DIR,
].forEach((dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});
const resolveStoredFilePath = (storedPath) => {
    const rel = String(storedPath || '').trim();
    if (!rel)
        return null;
    if (rel.startsWith('/uploads/')) {
        const relative = rel.replace(/^\/uploads\/?/, '');
        return path.join(exports.UPLOADS_DIR, relative);
    }
    if (rel.startsWith('private/')) {
        const relative = rel.replace(/^private\/?/, '');
        return path.join(exports.PRIVATE_UPLOADS_DIR, relative);
    }
    if (path.isAbsolute(rel))
        return rel;
    return path.join(path.dirname(exports.UPLOADS_DIR), rel.replace(/^\//, ''));
};
exports.resolveStoredFilePath = resolveStoredFilePath;
const safeUnlink = (filePath) => {
    if (!filePath)
        return;
    try {
        if (fs.existsSync(filePath))
            fs.unlinkSync(filePath);
    }
    catch (err) {
        console.error('Safe unlink failed', err);
    }
};
exports.safeUnlink = safeUnlink;
const safeMoveFile = (src, dest) => {
    try {
        const destDir = path.dirname(dest);
        if (!fs.existsSync(destDir))
            fs.mkdirSync(destDir, { recursive: true });
        fs.renameSync(src, dest);
    }
    catch (e) {
        try {
            fs.copyFileSync(src, dest);
            (0, exports.safeUnlink)(src);
        }
        catch (err) {
            console.error('Safe move failed', err);
        }
    }
};
exports.safeMoveFile = safeMoveFile;
//# sourceMappingURL=file.utils.js.map