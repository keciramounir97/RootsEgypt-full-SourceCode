"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStoredFilePayload = exports.filenameFromStoredPath = exports.toStoredBuffer = void 0;
const path = require("path");
const toStoredBuffer = (value) => {
    if (!value)
        return null;
    if (Buffer.isBuffer(value))
        return value.length ? value : null;
    if (value instanceof Uint8Array) {
        const buffer = Buffer.from(value);
        return buffer.length ? buffer : null;
    }
    if (typeof value === "string") {
        const buffer = Buffer.from(value, "base64");
        return buffer.length ? buffer : null;
    }
    return null;
};
exports.toStoredBuffer = toStoredBuffer;
const filenameFromStoredPath = (storedPath, fallback = "download") => {
    const raw = String(storedPath || "").trim();
    const filename = raw ? path.basename(raw) : "";
    return filename || fallback;
};
exports.filenameFromStoredPath = filenameFromStoredPath;
const getStoredFilePayload = (row, dataKey, mimeKey, pathKey, fallbackMimeType = "application/octet-stream", fallbackFilename = "download") => {
    const data = (0, exports.toStoredBuffer)(row === null || row === void 0 ? void 0 : row[dataKey]);
    if (!data)
        return null;
    return {
        data,
        mimeType: String((row === null || row === void 0 ? void 0 : row[mimeKey]) || fallbackMimeType),
        filename: (0, exports.filenameFromStoredPath)(row === null || row === void 0 ? void 0 : row[pathKey], fallbackFilename),
    };
};
exports.getStoredFilePayload = getStoredFilePayload;
//# sourceMappingURL=db-file.util.js.map