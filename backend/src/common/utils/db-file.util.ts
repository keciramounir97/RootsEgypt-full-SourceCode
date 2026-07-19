import * as path from "path";

export type StoredFilePayload = {
  data: Buffer;
  mimeType: string;
  filename: string;
};

export const toStoredBuffer = (value: unknown): Buffer | null => {
  if (!value) return null;
  if (Buffer.isBuffer(value)) return value.length ? value : null;
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

export const filenameFromStoredPath = (
  storedPath: unknown,
  fallback = "download",
) => {
  const raw = String(storedPath || "").trim();
  const filename = raw ? path.basename(raw) : "";
  return filename || fallback;
};

export const getStoredFilePayload = (
  row: Record<string, unknown> | null | undefined,
  dataKey: string,
  mimeKey: string,
  pathKey: string,
  fallbackMimeType = "application/octet-stream",
  fallbackFilename = "download",
): StoredFilePayload | null => {
  const data = toStoredBuffer(row?.[dataKey]);
  if (!data) return null;

  return {
    data,
    mimeType: String(row?.[mimeKey] || fallbackMimeType),
    filename: filenameFromStoredPath(row?.[pathKey], fallbackFilename),
  };
};
