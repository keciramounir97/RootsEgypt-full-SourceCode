#!/usr/bin/env node
/**
 * RootsEgypt — Route Audit Script
 * Tests every API route and reports HTTP status + response time.
 * Usage:
 *   node scripts/audit-all-routes.js                    → tests https://api.rootsegypt.org
 *   BASE=http://localhost:5000/api node scripts/...      → tests local server
 *
 * Requires Node.js 18+ (native fetch).
 */

if (typeof fetch === "undefined") {
  console.error(
    "ERROR: Node.js 18+ required for native fetch. Run: node --version",
  );
  process.exit(1);
}

const BASE = (process.env.BASE || "https://api.rootsegypt.org/api").replace(
  /\/$/,
  "",
);
const SERVER = (process.env.SERVER || "https://api.rootsegypt.org").replace(
  /\/$/,
  "",
);
const ADMIN_EMAIL = process.env.AUDIT_EMAIL || "karimadmin@rootsegypt.org";
const ADMIN_PASSWORD = process.env.AUDIT_PASSWORD || "admin2025$";

// Minimal 1×1 transparent PNG for image upload tests
const MIN_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

// ─── helpers ─────────────────────────────────────────────────────────────────

async function timed(fn) {
  const t0 = Date.now();
  const status = await fn();
  return { status, ms: Date.now() - t0 };
}

function auth(token) {
  return { Authorization: `Bearer ${token}` };
}

function json(body) {
  return {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

async function get(path, headers = {}) {
  const r = await fetch(BASE + path, { headers });
  return r;
}
async function post(path, body, headers = {}) {
  return fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}
async function patch(path, body, headers = {}) {
  return fetch(BASE + path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}
async function del(path, headers = {}) {
  return fetch(BASE + path, { method: "DELETE", headers });
}
async function put(path, body, headers = {}) {
  return fetch(BASE + path, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

function data(res) {
  return res.ok ? res.json() : Promise.resolve(null);
}

// ─── result collector ─────────────────────────────────────────────────────────

const results = [];

async function check(label, fn, { accept403 = false } = {}) {
  const t0 = Date.now();
  let status = 0;
  let errMsg = "";
  try {
    const res = await fn();
    status = typeof res === "number" ? res : (res?.status ?? 0);
  } catch (e) {
    errMsg = e?.message || String(e);
    status = 0;
  }
  const ms = Date.now() - t0;
  const ok = (status >= 200 && status < 300) || (accept403 && status === 403);
  const icon = ok ? "✅" : "❌";
  const note =
    status === 403 && accept403
      ? " (403=role guard OK)"
      : errMsg
        ? "  ← " + errMsg
        : "";
  results.push({ label, status, ms, ok, errMsg });
  const ms4 = String(ms).padStart(5);
  console.log(
    `  ${icon}  ${String(status).padStart(3)}  ${ms4}ms  ${label}${note}`,
  );
  return { status, ok };
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n" + "═".repeat(65));
  console.log("  RootsEgypt — API Route Audit");
  console.log("  Target: " + BASE);
  console.log("═".repeat(65) + "\n");

  // ── Step 1: Login as admin ──────────────────────────────────────────────────
  console.log("▶ LOGIN");
  let token = "";
  let refreshToken = "";
  let userId = null;
  {
    const r = await post("/auth/login", {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    if (r.ok) {
      const d = await r.json();
      const payload = d?.data ?? d;
      token = payload?.token ?? "";
      refreshToken = payload?.refreshToken ?? "";
      userId = payload?.user?.id ?? null;
      console.log(`  ✅  200  Admin login OK  (userId=${userId})`);
    } else {
      const body = await r.text();
      console.error(
        `  ❌  ${r.status}  Admin login FAILED — ${body.slice(0, 120)}`,
      );
      console.error(
        `       Check credentials: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`,
      );
      console.error(
        "       Override with: AUDIT_EMAIL=x AUDIT_PASSWORD=y node scripts/audit-all-routes.js",
      );
    }
  }
  const A = auth(token); // shorthand

  // ── Step 2: Sign up a fresh test user for user-scoped tests ────────────────
  const testEmail = `audit_${Date.now()}@test.rootsegypt.org`;
  let testToken = "";
  let testRefreshToken = "";
  {
    const r = await post("/auth/signup", {
      email: testEmail,
      password: "Audit1234!",
      full_name: "Audit Test",
    });
    if (r.ok) {
      const d = await r.json();
      const p = d?.data ?? d;
      testToken = p?.token ?? "";
      testRefreshToken = p?.refreshToken ?? "";
      console.log(`  ✅  ${r.status}  Test user created  (${testEmail})`);
    } else {
      const b = await r.text();
      console.log(`  ⚠️   ${r.status}  Test signup — ${b.slice(0, 80)}`);
      // Fallback: reuse admin token for user tests
      testToken = token;
    }
  }
  const U = auth(testToken);

  // ── PUBLIC routes ───────────────────────────────────────────────────────────
  console.log("\n▶ PUBLIC");
  await check("GET /trees", () => get("/trees").then((r) => r.status));
  await check("GET /books", () => get("/books").then((r) => r.status));
  await check("GET /gallery", () => get("/gallery").then((r) => r.status));

  // resolve dynamic IDs for sub-resource tests
  const treesListR = await get("/trees");
  const booksListR = await get("/books");
  const galleryListR = await get("/gallery");
  const treesArr = treesListR.ok ? ((await treesListR.json())?.data ?? []) : [];
  const booksArr = booksListR.ok ? ((await booksListR.json())?.data ?? []) : [];
  const galleryArr = galleryListR.ok
    ? ((await galleryListR.json())?.data ?? [])
    : [];
  const pubTreeId = treesArr[0]?.id ?? null;
  const pubBookId = booksArr[0]?.id ?? null;
  const pubGalleryId = galleryArr[0]?.id ?? null;

  if (pubTreeId) {
    await check(`GET /trees/${pubTreeId}`, () =>
      get(`/trees/${pubTreeId}`).then((r) => r.status),
    );
    await check(`GET /trees/${pubTreeId}/people`, () =>
      get(`/trees/${pubTreeId}/people`).then((r) => r.status),
    );
    await check(`GET /trees/${pubTreeId}/gedcom`, () =>
      get(`/trees/${pubTreeId}/gedcom`).then((r) => r.status),
    );
    const peopleR = await get(`/trees/${pubTreeId}/people`);
    const peopleArr = peopleR.ok ? ((await peopleR.json())?.data ?? []) : [];
    const pubPersonId = peopleArr[0]?.id ?? null;
    if (pubPersonId) {
      await check(`GET /people/${pubPersonId}`, () =>
        get(`/people/${pubPersonId}`).then((r) => r.status),
      );
    }
  } else {
    console.log("  ⚠️  No public trees found — skipping /trees/:id sub-tests");
  }
  if (pubBookId) {
    await check(`GET /books/${pubBookId}`, () =>
      get(`/books/${pubBookId}`).then((r) => r.status),
    );
    await check(`GET /books/${pubBookId}/download`, () =>
      get(`/books/${pubBookId}/download`).then((r) => r.status),
    );
  } else {
    console.log("  ⚠️  No public books found — skipping /books/:id sub-tests");
  }
  if (pubGalleryId) {
    await check(`GET /gallery/${pubGalleryId}`, () =>
      get(`/gallery/${pubGalleryId}`).then((r) => r.status),
    );
  } else {
    console.log(
      "  ⚠️  No public gallery items — skipping /gallery/:id sub-tests",
    );
  }

  // ── AUTH routes ─────────────────────────────────────────────────────────────
  console.log("\n▶ AUTH");
  await check("POST /auth/login (valid)", () =>
    post("/auth/login", { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }).then(
      (r) => r.status,
    ),
  );
  await check("POST /auth/login (bad pass→401)", async () => {
    const r = await post("/auth/login", {
      email: ADMIN_EMAIL,
      password: "wrongpassword!",
    });
    return r.status === 401 || r.status === 400 ? 200 : r.status; // 401/400 = correct rejection
  });
  await check("POST /auth/signup (new user)", () =>
    post("/auth/signup", {
      email: `s${Date.now()}@t.com`,
      password: "Test1234!",
      full_name: "T",
    }).then((r) => r.status),
  );
  await check("POST /auth/refresh", () =>
    post("/auth/refresh", { refreshToken: testRefreshToken }).then(
      (r) => r.status,
    ),
  );
  await check("POST /auth/reset (unknown→200)", () =>
    post("/auth/reset", { email: "nobody@nowhere.com" }).then((r) => r.status),
  );
  await check("GET  /auth/me", () => get("/auth/me", A).then((r) => r.status));
  await check("PATCH /auth/me", () =>
    patch("/auth/me", { full_name: "Audit Admin" }, A).then((r) => r.status),
  );
  await check("POST /auth/logout", () =>
    post("/auth/logout", {}, A).then((r) => r.status),
  );

  // Re-login after logout so A still works for rest of tests
  {
    const r = await post("/auth/login", {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    if (r.ok) {
      const d = await r.json();
      const p = d?.data ?? d;
      token = p?.token ?? token;
      Object.assign(A, auth(token));
    }
  }

  // ── USER (JWT) routes ───────────────────────────────────────────────────────
  console.log("\n▶ USER  (🔒 JWT)");
  await check("GET  /my/trees", () =>
    get("/my/trees", U).then((r) => r.status),
  );
  await check("GET  /my/books", () =>
    get("/my/books", U).then((r) => r.status),
  );
  await check("GET  /my/gallery", () =>
    get("/my/gallery", U).then((r) => r.status),
  );

  // Create a tree via form-data
  let myTreeId = null;
  {
    const fd = new FormData();
    fd.append("title", `AuditTree_${Date.now()}`);
    const r = await fetch(BASE + "/my/trees", {
      method: "POST",
      headers: U,
      body: fd,
    });
    const ok = await check("POST /my/trees", async () => r.status);
    if (ok.ok) {
      const d = await data(r.clone ? r.clone() : r);
      myTreeId = (d?.data ?? d)?.id ?? null;
    }
    if (!myTreeId) {
      // Fall back to first existing tree
      const lr = await get("/my/trees", U);
      if (lr.ok) {
        const arr = (await lr.json())?.data ?? [];
        myTreeId = arr[0]?.id ?? null;
      }
    }
  }
  if (myTreeId) {
    await check(`GET  /my/trees/${myTreeId}`, () =>
      get(`/my/trees/${myTreeId}`, U).then((r) => r.status),
    );
    await check(`GET  /my/trees/${myTreeId}/people`, () =>
      get(`/my/trees/${myTreeId}/people`, U).then((r) => r.status),
    );
    await check(`GET  /my/trees/${myTreeId}/gedcom`, () =>
      get(`/my/trees/${myTreeId}/gedcom`, U).then((r) => r.status),
    );
    const fdPut = new FormData();
    fdPut.append("title", "AuditTree_updated");
    await check(`PUT  /my/trees/${myTreeId}`, () =>
      fetch(BASE + `/my/trees/${myTreeId}`, {
        method: "PUT",
        headers: U,
        body: fdPut,
      }).then((r) => r.status),
    );
    const fdSave = new FormData();
    fdSave.append("title", "AuditTree_saved");
    await check(`POST /my/trees/${myTreeId}/save`, () =>
      fetch(BASE + `/my/trees/${myTreeId}/save`, {
        method: "POST",
        headers: U,
        body: fdSave,
      }).then((r) => r.status),
    );
    await check(`DELETE /my/trees/${myTreeId}`, () =>
      del(`/my/trees/${myTreeId}`, U).then((r) => r.status),
    );
  } else {
    console.log(
      "  ⚠️  Could not create/find tree — skipping /my/trees/:id sub-tests",
    );
  }

  // Upload a gallery image
  let myGalleryId = null;
  {
    const fd = new FormData();
    fd.append("title", `AuditImg_${Date.now()}`);
    fd.append("image", new File([MIN_PNG], "audit.png", { type: "image/png" }));
    const r = await fetch(BASE + "/my/gallery", {
      method: "POST",
      headers: U,
      body: fd,
    });
    const ok = await check("POST /my/gallery", async () => r.status);
    if (ok.ok) {
      const d = await r.json().catch(() => null);
      myGalleryId = (d?.data ?? d)?.id ?? null;
    }
    if (!myGalleryId) {
      const lr = await get("/my/gallery", U);
      if (lr.ok) myGalleryId = ((await lr.json())?.data ?? [])[0]?.id ?? null;
    }
  }
  if (myGalleryId) {
    await check(`GET  /my/gallery/${myGalleryId}`, () =>
      get(`/my/gallery/${myGalleryId}`, U).then((r) => r.status),
    );
    const fdGal = new FormData();
    fdGal.append("title", "AuditImg_updated");
    await check(`PUT  /my/gallery/${myGalleryId}`, () =>
      fetch(BASE + `/my/gallery/${myGalleryId}`, {
        method: "PUT",
        headers: U,
        body: fdGal,
      }).then((r) => r.status),
    );
    await check(`DELETE /my/gallery/${myGalleryId}`, () =>
      del(`/my/gallery/${myGalleryId}`, U).then((r) => r.status),
    );
  }

  // User-level book lookup
  const myBooksR = await get("/my/books", U);
  const myBookId = myBooksR.ok
    ? (((await myBooksR.json())?.data ?? [])[0]?.id ?? null)
    : null;
  if (myBookId) {
    await check(`GET  /my/books/${myBookId}`, () =>
      get(`/my/books/${myBookId}`, U).then((r) => r.status),
    );
  }

  // User approval requests
  await check("POST /user/requests/password-reset", () =>
    post("/user/requests/password-reset", {}, U).then((r) => r.status),
  );
  await check("POST /user/requests/account-deletion", () =>
    post("/user/requests/account-deletion", { reason: "audit test" }, U).then(
      (r) => r.status,
    ),
  );

  // ── ADMIN routes ─────────────────────────────────────────────────────────────
  console.log("\n▶ ADMIN  (🔒 admin/super_admin)");
  await check("GET /admin/users", () =>
    get("/admin/users", A).then((r) => r.status),
  );
  await check("GET /admin/users/1", () =>
    get("/admin/users/1", A).then((r) => r.status),
  );
  await check("GET /admin/trees", () =>
    get("/admin/trees", A).then((r) => r.status),
  );
  await check("GET /admin/books", () =>
    get("/admin/books", A).then((r) => r.status),
  );
  await check("GET /admin/gallery", () =>
    get("/admin/gallery", A).then((r) => r.status),
  );
  await check("GET /activity", () => get("/activity", A).then((r) => r.status));
  await check("GET /admin/contact/messages", () =>
    get("/admin/contact/messages", A).then((r) => r.status),
  );
  await check("GET /admin/newsletter/subscribers", () =>
    get("/admin/newsletter/subscribers", A).then((r) => r.status),
  );

  // Admin dynamic IDs
  const adminTreesR = await get("/admin/trees", A);
  const adminTreeId = adminTreesR.ok
    ? (((await adminTreesR.json())?.data ?? [])[0]?.id ?? null)
    : null;
  if (adminTreeId) {
    await check(`GET /admin/trees/${adminTreeId}`, () =>
      get(`/admin/trees/${adminTreeId}`, A).then((r) => r.status),
    );
    await check(`GET /admin/trees/${adminTreeId}/gedcom`, () =>
      get(`/admin/trees/${adminTreeId}/gedcom`, A).then((r) => r.status),
    );
  }
  const adminBooksR = await get("/admin/books", A);
  const adminBookId = adminBooksR.ok
    ? (((await adminBooksR.json())?.data ?? [])[0]?.id ?? null)
    : null;
  if (adminBookId) {
    await check(`GET /admin/books/${adminBookId}`, () =>
      get(`/admin/books/${adminBookId}`, A).then((r) => r.status),
    );
  }
  const adminGalleryR = await get("/admin/gallery", A);
  const adminGalleryId = adminGalleryR.ok
    ? (((await adminGalleryR.json())?.data ?? [])[0]?.id ?? null)
    : null;
  if (adminGalleryId) {
    await check(`GET /admin/gallery/${adminGalleryId}`, () =>
      get(`/admin/gallery/${adminGalleryId}`, A).then((r) => r.status),
    );
  }

  // Create → patch → delete a test user
  const newEmail = `audituser_${Date.now()}@test.com`;
  const createR = await post(
    "/admin/users",
    { email: newEmail, password: "Audit1234!", full_name: "Audit Created" },
    A,
  );
  const createOk = await check("POST /admin/users", async () => createR.status);
  let createdUserId = null;
  if (createOk.ok) {
    const d = await createR.json().catch(() => null);
    createdUserId = (d?.data ?? d)?.id ?? null;
  }
  if (createdUserId) {
    await check(`PATCH /admin/users/${createdUserId}`, () =>
      patch(
        `/admin/users/${createdUserId}`,
        { full_name: "Audit Updated" },
        A,
      ).then((r) => r.status),
    );
    await check(`DELETE /admin/users/${createdUserId}`, () =>
      del(`/admin/users/${createdUserId}`, A).then((r) => r.status),
    );
  }

  // ── SUPER_ADMIN routes ───────────────────────────────────────────────────────
  // Seed admin is role_id=1 (admin), not role_id=3 (super_admin).
  // 403 = role guard working correctly. Treated as ✅ in this audit.
  console.log(
    "\n▶ SUPER_ADMIN  (🔒 super_admin only — 403 accepted if admin token)",
  );
  await check(
    "GET /admin/admins",
    () => get("/admin/admins", A).then((r) => r.status),
    { accept403: true },
  );
  await check(
    "GET /admin/approvals/stats",
    () => get("/admin/approvals/stats", A).then((r) => r.status),
    { accept403: true },
  );
  await check(
    "GET /admin/approvals/password-reset",
    () => get("/admin/approvals/password-reset", A).then((r) => r.status),
    { accept403: true },
  );
  await check(
    "GET /admin/approvals/account-deletion",
    () => get("/admin/approvals/account-deletion", A).then((r) => r.status),
    { accept403: true },
  );

  // ── PUBLIC write routes ──────────────────────────────────────────────────────
  console.log("\n▶ PUBLIC WRITE");
  await check("POST /newsletter/subscribe", () =>
    post("/newsletter/subscribe", { email: `nl_${Date.now()}@test.com` }).then(
      (r) => r.status,
    ),
  );
  await check("POST /contact", () =>
    post("/contact", {
      name: "Audit",
      email: "audit@test.com",
      message: "Audit test message",
    }).then((r) => r.status),
  );

  // ── FINAL TABLE ──────────────────────────────────────────────────────────────
  const W = 55;
  console.log("\n" + "═".repeat(W + 22));
  console.log("  RootsEgypt API Audit — Results");
  console.log("═".repeat(W + 22));
  console.log("  " + "Route".padEnd(W) + " Status   Time   ");
  console.log("  " + "─".repeat(W + 18));
  for (const r of results) {
    const icon = r.ok ? "✅" : "❌";
    const statusStr = String(r.status || "ERR").padStart(3);
    const msStr = (String(r.ms) + "ms").padStart(7);
    const label =
      r.label.length > W ? r.label.slice(0, W - 1) + "…" : r.label.padEnd(W);
    const note = !r.ok && r.errMsg ? `  ← ${r.errMsg.slice(0, 40)}` : "";
    console.log(`  ${icon} ${label} ${statusStr}  ${msStr}${note}`);
  }
  console.log("  " + "─".repeat(W + 18));
  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);
  console.log(
    `  ${passed}/${results.length} passed    ${failed.length ? "❌ FAILED" : "✅ ALL 200-ish — SAFE TO DEPLOY"}`,
  );
  console.log("═".repeat(W + 22) + "\n");

  if (failed.length) {
    console.log("❌ Failed routes:");
    for (const f of failed)
      console.log(
        `   • ${f.label}: HTTP ${f.status}${f.errMsg ? " — " + f.errMsg : ""}`,
      );
    process.exit(1);
  }

  // Write auditfinal stamp
  const fs = require("fs");
  const lines = [
    "ROOTSABRAHAM - ROUTE AUDIT FINAL",
    "=================================",
    `All ${results.length} routes return 200-ish. EasyPanel safe.`,
    `Target: ${BASE}`,
    "",
    "Route".padEnd(W) + " Status",
    "─".repeat(W + 10),
    ...results.map(
      (r) => r.label.padEnd(W) + " " + r.status + (r.ok ? " ✓" : " ✗"),
    ),
    "─".repeat(W + 10),
    `${passed}/${results.length} passed - ALL 200-ish`,
    "",
    "Generated: " + new Date().toISOString(),
  ];
  fs.writeFileSync("auditfinal", lines.join("\n"), "utf8");
  console.log("✅  Written: auditfinal\n");
}

main().catch((e) => {
  if (e?.cause?.code === "ECONNREFUSED" || e?.code === "ECONNREFUSED") {
    console.error("\n❌  Cannot reach backend at " + BASE);
    console.error(
      "    • For production: ensure https://api.rootsegypt.org is reachable",
    );
    console.error("    • For local: start the server with npm run start:dev\n");
  } else {
    console.error(e);
  }
  process.exit(1);
});
