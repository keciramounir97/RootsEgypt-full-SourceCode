import {
  filenameFromStoredPath,
  getStoredFilePayload,
  toStoredBuffer,
} from "./db-file.util";

describe("db-file utilities", () => {
  it("normalizes stored binary values", () => {
    expect(toStoredBuffer(Buffer.from("hello"))?.toString()).toBe("hello");
    expect(toStoredBuffer(new Uint8Array([104, 105]))?.toString()).toBe("hi");
    expect(toStoredBuffer(null)).toBeNull();
  });

  it("builds a payload with mime type and filename", () => {
    const payload = getStoredFilePayload(
      {
        image_data: Buffer.from("img"),
        image_mime_type: "image/png",
        image_path: "/uploads/gallery/photo.png",
      },
      "image_data",
      "image_mime_type",
      "image_path",
      "application/octet-stream",
    );

    expect(payload?.data.toString()).toBe("img");
    expect(payload?.mimeType).toBe("image/png");
    expect(payload?.filename).toBe("photo.png");
  });

  it("falls back to a safe filename", () => {
    expect(filenameFromStoredPath("", "tree.ged")).toBe("tree.ged");
  });
});
