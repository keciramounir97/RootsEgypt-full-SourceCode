# Make uploads survive redeploys (EasyPanel persistent volume)

**Why:** the backend writes uploaded files (GEDCOM trees, book files, gallery
images, documents) to `/app/uploads` inside the container. Without a persistent
volume, that folder is part of the container's ephemeral filesystem and is
**wiped every time the image is rebuilt/redeployed**. This is what blanked the
family trees on Roots Egypt. The database now also stores this content as a safety net, but a
volume is the proper fix so the original files themselves are never lost.

> A `VOLUME` line in the Dockerfile is **not** enough on EasyPanel — it creates
> an anonymous volume that is discarded on each redeploy. The mount must be
> declared in the EasyPanel service config so it maps to a named, persistent
> volume on the host.

## Steps (do this once per backend service)

1. Open EasyPanel → your project → the **backend** service.
2. Go to the **Mounts** (a.k.a. **Volumes**) tab → **Add Mount**.
3. Add a **Volume** mount:
   - **Type:** Volume
   - **Name:** `uploads` (any stable name)
   - **Mount Path:** `/app/uploads`
4. Add a second **Volume** mount for private uploads (trees marked private):
   - **Type:** Volume
   - **Name:** `private-uploads`
   - **Mount Path:** `/app/private_uploads`
5. **Save**, then **Deploy** the service.

## Important: seed the volume the first time

The Dockerfile does `COPY uploads/ ./uploads/` to ship bundled/seed files. When
you attach an **empty** volume at `/app/uploads`, it can hide those copied
files on the very first boot. Two safe options:

- **Preferred:** after attaching the volume and deploying, re-upload any files
  you still have, or let the boot-time backfill/DB fallback serve them (the
  backend already falls back to the database copy when a file is missing).
- Or, before attaching the volume, `docker cp` the current container's
  `/app/uploads` to the host, then point the volume's host path at that folder.

## Verify

After deploy, upload a new tree/book/image, then trigger a redeploy. The file
must still be downloadable afterward. If it survives the redeploy, the volume
is working.
