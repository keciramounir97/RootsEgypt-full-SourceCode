# Where uploads are stored

When you run the backend (from the `backend` folder), uploads are stored under:

- **Public tree GEDCOM files:** `backend/uploads/trees/`
  - Database stores a path like `/uploads/trees/<filename>.ged` (or `.gedx`, etc.)
- **Private tree GEDCOM files:** `backend/private_uploads/trees/`
  - Database stores a path like `private/trees/<filename>`

If a tree has **no GEDCOM file** (never uploaded, or file deleted), the API still returns **200** with a minimal empty GEDCOM so the tree opens in the builder with no people. To get real data for a tree:

1. **Re-upload:** In the admin or “My trees” UI, edit the tree and upload a GEDCOM file (Save/“Enregistrer sous” with a file).
2. **Manual copy:** Put the `.ged` / `.gedx` file in `backend/uploads/trees/` (or `backend/private_uploads/trees/` for private trees), then set that tree’s `gedcom_path` in the database to `/uploads/trees/<filename>` or `private/trees/<filename>`.

The `uploads` and `private_uploads` directories (and their `trees` subfolders) are created automatically on server startup if they don’t exist.
