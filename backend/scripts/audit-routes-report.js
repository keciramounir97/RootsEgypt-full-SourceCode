#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

if (typeof fetch === "undefined" || typeof FormData === "undefined") {
  console.error("ERROR: Node.js 18+ is required for route auditing.");
  process.exit(1);
}

const BASE = String(process.env.BASE || "https://api.rootsegypt.org/api").replace(
  /\/+$/,
  "",
);
const SERVER = String(process.env.SERVER || "https://api.rootsegypt.org").replace(
  /\/+$/,
  "",
);
const AUDIT_EMAIL = String(
  process.env.AUDIT_EMAIL || "karimadmin@rootsegypt.org",
).trim();
const AUDIT_PASSWORD = String(process.env.AUDIT_PASSWORD || "admin2025$");
const ALLOW_REMOTE =
  String(process.env.AUDIT_ALLOW_REMOTE || "").toLowerCase() === "true";
const REPORT_DIR = path.join(process.cwd(), "report", "route-audit");

const MIN_PNG_BYTES = Uint8Array.from(
  Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  ),
);
const MIN_PDF_BYTES = Buffer.from(
  "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n",
  "utf8",
);

function ensureSafeTarget() {
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(SERVER);
  if (!isLocal && !ALLOW_REMOTE) {
    console.error(
      "ERROR: Remote audit target blocked. Set AUDIT_ALLOW_REMOTE=true to audit a non-local API.",
    );
    process.exit(1);
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parseJson(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function unwrapData(payload) {
  if (!payload || typeof payload !== "object") return payload;
  return payload.data ?? payload;
}

function summarizeBody(text) {
  if (!text) return "";
  const compact = text.replace(/\s+/g, " ").trim();
  return compact.slice(0, 180);
}

async function request(method, routePath, options = {}) {
  const url = `${BASE}${routePath}`;
  const headers = { Accept: "application/json", ...(options.headers || {}) };
  const init = {
    method,
    headers,
  };

  if (options.body instanceof FormData) {
    init.body = options.body;
    delete headers["Content-Type"];
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(options.body);
  }

  const startedAt = Date.now();
  let response;
  let responseText = "";
  let errorMessage = "";

  try {
    response = await fetch(url, init);
    responseText = await response.text();
  } catch (error) {
    errorMessage = error?.message || String(error);
  }

  return {
    url,
    status: response?.status || 0,
    ms: Date.now() - startedAt,
    ok: Boolean(response?.ok),
    body: responseText,
    parsed: parseJson(responseText),
    errorMessage,
  };
}

async function runCheck(results, config) {
  const expected = Array.isArray(config.expected)
    ? config.expected
    : [config.expected];
  const response = await request(config.method, config.path, config.options);
  const matched = expected.includes(response.status);
  const note =
    response.errorMessage ||
    config.note ||
    summarizeBody(response.body) ||
    "";

  results.push({
    group: config.group,
    method: config.method,
    path: config.path,
    status: response.status,
    expected,
    ms: response.ms,
    ok: matched,
    note,
  });

  const icon = matched ? "[OK]" : "[FAIL]";
  console.log(
    `${icon} ${String(response.status).padStart(3)} ${String(response.ms).padStart(5)}ms ${config.method.padEnd(6)} ${config.path}`,
  );
  return response;
}

function addSkip(results, group, method, routePath, note) {
  results.push({
    group,
    method,
    path: routePath,
    status: "SKIP",
    expected: ["SKIP"],
    ms: 0,
    ok: true,
    note,
  });
  console.log(`[OK] SKIP     0ms ${method.padEnd(6)} ${routePath}`);
}

function buildHtml(results, metadata) {
  const rows = results
    .map((row) => {
      const badgeClass = row.ok ? "ok" : "fail";
      const statusClass = row.ok ? "ok-text" : "fail-text";
      return `
        <tr>
          <td>${escapeHtml(row.group)}</td>
          <td><code>${escapeHtml(row.method)}</code></td>
          <td><code>${escapeHtml(row.path)}</code></td>
          <td class="${statusClass}">${escapeHtml(row.status)}</td>
          <td>${escapeHtml(
            Array.isArray(row.expected) ? row.expected.join(", ") : String(row.expected),
          )}</td>
          <td>${escapeHtml(`${row.ms} ms`)}</td>
          <td><span class="badge ${badgeClass}">${row.ok ? "Green check" : "Needs fix"}</span></td>
          <td>${escapeHtml(row.note || "")}</td>
        </tr>
      `;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Roots Egypt Route Audit</title>
  <style>
    :root {
      --bg: #f7f2e8;
      --panel: rgba(255,255,255,0.92);
      --ink: #122033;
      --muted: #637083;
      --line: #d8c7b0;
      --brand: #0c4a6e;
      --ok: #0f766e;
      --ok-bg: rgba(15,118,110,0.12);
      --fail: #b42318;
      --fail-bg: rgba(180,35,24,0.12);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Segoe UI", Manrope, Arial, sans-serif;
      background: linear-gradient(180deg, rgba(247,242,232,0.96), rgba(247,242,232,0.96));
      color: var(--ink);
    }
    .wrap { max-width: 1440px; margin: 0 auto; padding: 40px 24px 64px; }
    .hero {
      background: linear-gradient(135deg, rgba(12,74,110,0.97), rgba(18,32,51,0.96));
      color: white;
      border-radius: 28px;
      padding: 28px;
      margin-bottom: 24px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 14px;
      margin-bottom: 20px;
    }
    .card, .table-shell {
      background: var(--panel);
      border: 1px solid rgba(216,199,176,0.72);
      border-radius: 22px;
      padding: 18px;
    }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td {
      padding: 14px 12px;
      border-bottom: 1px solid rgba(216,199,176,0.72);
      text-align: left;
      vertical-align: top;
    }
    th {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: var(--muted);
      background: rgba(12,74,110,0.04);
    }
    tr:last-child td { border-bottom: none; }
    .badge {
      display: inline-flex;
      padding: 7px 11px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
    }
    .badge.ok { color: var(--ok); background: var(--ok-bg); }
    .badge.fail { color: var(--fail); background: var(--fail-bg); }
    .ok-text { color: var(--ok); font-weight: 700; }
    .fail-text { color: var(--fail); font-weight: 700; }
    code { color: var(--brand); }
  </style>
</head>
<body>
  <div class="wrap">
    <section class="hero">
      <h1>Roots Egypt route audit</h1>
      <p>Target: ${escapeHtml(metadata.base)}</p>
      <p>Generated: ${escapeHtml(metadata.generatedAt)}</p>
    </section>
    <section class="summary">
      <div class="card"><strong>${metadata.total}</strong><div>Total checks</div></div>
      <div class="card"><strong class="ok-text">${metadata.passed}</strong><div>Passed</div></div>
      <div class="card"><strong class="fail-text">${metadata.failed}</strong><div>Failed</div></div>
      <div class="card"><strong>${metadata.avgMs} ms</strong><div>Average timing</div></div>
    </section>
    <section class="table-shell">
      <table>
        <thead>
          <tr>
            <th>Group</th>
            <th>Method</th>
            <th>Path</th>
            <th>Status</th>
            <th>Expected</th>
            <th>Timing</th>
            <th>Verdict</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </section>
  </div>
</body>
</html>`;
}

function writeReport(results) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const passed = results.filter((row) => row.ok).length;
  const failed = results.length - passed;
  const avgMs = results.length
    ? Math.round(
        results.reduce((sum, row) => sum + (Number(row.ms) || 0), 0) / results.length,
      )
    : 0;
  const metadata = {
    base: BASE,
    server: SERVER,
    generatedAt: new Date().toISOString(),
    total: results.length,
    passed,
    failed,
    avgMs,
  };

  fs.writeFileSync(
    path.join(REPORT_DIR, "results.json"),
    JSON.stringify({ metadata, results }, null, 2),
    "utf8",
  );
  fs.writeFileSync(
    path.join(REPORT_DIR, "index.html"),
    buildHtml(results, metadata),
    "utf8",
  );
}

async function createTree(authHeaders) {
  const form = new FormData();
  form.append("title", `Audit Tree ${Date.now()}`);
  form.append("description", "Route audit tree");
  form.append("isPublic", "true");
  const response = await request("POST", "/my/trees", {
    headers: authHeaders,
    body: form,
  });
  const payload = unwrapData(response.parsed);
  return payload?.id || null;
}

async function createGallery(authHeaders) {
  const form = new FormData();
  form.append("title", `Audit Gallery ${Date.now()}`);
  form.append("description", "Route audit gallery item");
  form.append("isPublic", "true");
  form.append(
    "image",
    new File([MIN_PNG_BYTES], "audit.png", { type: "image/png" }),
  );
  const response = await request("POST", "/my/gallery", {
    headers: authHeaders,
    body: form,
  });
  const payload = unwrapData(response.parsed);
  return payload?.id || null;
}

async function createBook(authHeaders) {
  const form = new FormData();
  form.append("title", `Audit Book ${Date.now()}`);
  form.append("description", "Route audit book");
  form.append("author", "Roots Egypt Audit");
  form.append("isPublic", "true");
  form.append(
    "file",
    new File([MIN_PDF_BYTES], "audit.pdf", { type: "application/pdf" }),
  );
  const response = await request("POST", "/my/books", {
    headers: authHeaders,
    body: form,
  });
  const payload = unwrapData(response.parsed);
  return payload?.id || null;
}

async function createPerson(authHeaders, treeId) {
  const response = await request("POST", `/my/trees/${treeId}/people`, {
    headers: authHeaders,
    body: {
      name: `Audit Person ${Date.now()}`,
      gender: "male",
    },
  });
  const payload = unwrapData(response.parsed);
  return payload?.id || null;
}

async function createAdminUser(authHeaders) {
  const email = `route_user_${Date.now()}@test.rootsegypt.org`;
  const response = await request("POST", "/admin/users", {
    headers: authHeaders,
    body: {
      email,
      password: "Audit1234!",
      full_name: "Audit User",
    },
  });
  const payload = unwrapData(response.parsed);
  return payload?.id || null;
}

async function firstId(routePath) {
  const response = await request("GET", routePath);
  const payload = unwrapData(response.parsed);
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.gallery)
        ? payload.gallery
        : [];
  return list[0]?.id || null;
}

async function firstIdAuthed(routePath, authHeaders) {
  const response = await request("GET", routePath, { headers: authHeaders });
  const payload = unwrapData(response.parsed);
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : [];
  return list[0]?.id || null;
}

async function main() {
  ensureSafeTarget();

  const results = [];
  const loginResponse = await request("POST", "/auth/login", {
    body: { email: AUDIT_EMAIL, password: AUDIT_PASSWORD },
  });
  const loginPayload = unwrapData(loginResponse.parsed);
  const adminToken =
    loginPayload?.token || loginPayload?.accessToken || "";
  const refreshToken = loginPayload?.refreshToken || "";
  const dbUnavailable = loginResponse.status === 503;
  const authHeaders = adminToken
    ? { Authorization: `Bearer ${adminToken}` }
    : {};

  console.log(`Auditing ${BASE}`);
  console.log(
    `Auth mode: ${adminToken ? "admin-token" : "guest-route-surface"}\n`,
  );

  let treeId = null;
  let personId = null;
  let galleryId = null;
  let bookId = null;
  let createdUserId = null;

  if (adminToken) {
    treeId = (await createTree(authHeaders)) || (await firstId("/trees"));
    if (treeId) {
      personId = await createPerson(authHeaders, treeId);
    }
    galleryId =
      (await createGallery(authHeaders)) || (await firstId("/gallery"));
    bookId = (await createBook(authHeaders)) || (await firstId("/books"));
    createdUserId = await createAdminUser(authHeaders);
  }

  await runCheck(results, {
    group: "health",
    method: "GET",
    path: "/health/live",
    expected: [200],
  });
  await runCheck(results, {
    group: "health",
    method: "GET",
    path: "/health",
    expected: [200, 503],
  });
  await runCheck(results, {
    group: "health",
    method: "GET",
    path: "/db-health",
    expected: [200, 503],
  });
  await runCheck(results, {
    group: "search",
    method: "GET",
    path: "/search?q=roots",
    expected: [200],
  });
  await runCheck(results, {
    group: "search",
    method: "GET",
    path: "/search/suggest?q=roots",
    expected: [200],
  });

  await runCheck(results, {
    group: "public",
    method: "GET",
    path: "/trees",
    expected: [200],
  });
  if (treeId) {
    await runCheck(results, {
      group: "public",
      method: "GET",
      path: `/trees/${treeId}`,
      expected: [200],
    });
    await runCheck(results, {
      group: "public",
      method: "GET",
      path: `/trees/${treeId}/people`,
      expected: [200],
    });
    await runCheck(results, {
      group: "public",
      method: "GET",
      path: `/trees/${treeId}/gedcom`,
      expected: [200, 404],
      note: "GEDCOM download depends on uploaded file presence",
    });
  } else {
    addSkip(results, "public", "GET", "/trees/:id", "No public tree available for item-route audit");
  }

  if (personId) {
    await runCheck(results, {
      group: "public",
      method: "GET",
      path: `/people/${personId}`,
      expected: [200],
    });
  } else {
    addSkip(results, "public", "GET", "/people/:id", "No person record available for item-route audit");
  }

  await runCheck(results, {
    group: "public",
    method: "GET",
    path: "/books",
    expected: [200],
  });
  if (bookId) {
    await runCheck(results, {
      group: "public",
      method: "GET",
      path: `/books/${bookId}`,
      expected: [200],
    });
    await runCheck(results, {
      group: "public",
      method: "GET",
      path: `/books/${bookId}/download`,
      expected: [200],
    });
  } else {
    addSkip(results, "public", "GET", "/books/:id", "No public book available for item-route audit");
  }

  await runCheck(results, {
    group: "public",
    method: "GET",
    path: "/gallery",
    expected: [200],
  });
  if (galleryId) {
    await runCheck(results, {
      group: "public",
      method: "GET",
      path: `/gallery/${galleryId}`,
      expected: [200],
    });
  } else {
    addSkip(results, "public", "GET", "/gallery/:id", "No public gallery item available for item-route audit");
  }

  await runCheck(results, {
    group: "auth",
    method: "POST",
    path: "/auth/login",
    expected: dbUnavailable ? [200, 503] : [200],
    options: { body: { email: AUDIT_EMAIL, password: AUDIT_PASSWORD } },
  });
  await runCheck(results, {
    group: "auth",
    method: "POST",
    path: "/auth/login",
    expected: dbUnavailable ? [400, 401, 503] : [400, 401],
    options: {
      body: { email: AUDIT_EMAIL, password: "wrong-password-for-audit" },
    },
  });
  await runCheck(results, {
    group: "auth",
    method: "POST",
    path: "/auth/signup",
    expected: dbUnavailable ? [200, 201, 409, 503] : [200, 201, 409],
    options: {
      body: {
        email: `audit_${Date.now()}@test.rootsegypt.org`,
        password: "Audit1234!",
        full_name: "Audit Route Check",
      },
    },
  });
  await runCheck(results, {
    group: "auth",
    method: "POST",
    path: "/auth/refresh",
    expected: refreshToken ? [200] : [400, 401, 503],
    options: { body: { refreshToken: refreshToken || "invalid-refresh-token" } },
  });
  await runCheck(results, {
    group: "auth",
    method: "POST",
    path: "/auth/reset",
    expected: [200],
    options: { body: { email: AUDIT_EMAIL } },
  });
  await runCheck(results, {
    group: "auth",
    method: "POST",
    path: "/auth/reset/token",
    expected: [400, 401],
    options: { body: { token: "invalid-token", password: "Audit1234!" } },
  });
  await runCheck(results, {
    group: "auth",
    method: "POST",
    path: "/auth/reset/verify",
    expected: [400, 401],
    options: { body: { email: AUDIT_EMAIL, code: "000000" } },
  });
  await runCheck(results, {
    group: "auth",
    method: "GET",
    path: "/auth/me",
    expected: adminToken ? [200] : [401],
    options: { headers: authHeaders },
  });
  await runCheck(results, {
    group: "auth",
    method: "PATCH",
    path: "/auth/me",
    expected: adminToken ? [200, 400] : [401],
    options: { headers: authHeaders, body: { full_name: "Audit Name" } },
  });

  await runCheck(results, {
    group: "user",
    method: "GET",
    path: "/my/trees",
    expected: adminToken ? [200] : [401],
    options: { headers: authHeaders },
  });
  if (treeId) {
    await runCheck(results, {
      group: "user",
      method: "GET",
      path: `/my/trees/${treeId}`,
      expected: adminToken ? [200] : [401],
      options: { headers: authHeaders },
    });
    await runCheck(results, {
      group: "user",
      method: "PUT",
      path: `/my/trees/${treeId}`,
      expected: adminToken ? [200, 400] : [401],
      options: {
        headers: authHeaders,
        body: { title: "Audit Tree Updated", isPublic: true },
      },
    });
    await runCheck(results, {
      group: "user",
      method: "POST",
      path: `/my/trees/${treeId}/save`,
      expected: adminToken ? [200, 201, 400] : [401],
      options: {
        headers: authHeaders,
        body: { title: "Audit Tree Saved", isPublic: true },
      },
    });
    await runCheck(results, {
      group: "user",
      method: "GET",
      path: `/my/trees/${treeId}/gedcom`,
      expected: adminToken ? [200, 404] : [401],
      options: { headers: authHeaders },
      note: "Private GEDCOM download depends on uploaded file presence",
    });
    await runCheck(results, {
      group: "user",
      method: "GET",
      path: `/my/trees/${treeId}/people`,
      expected: adminToken ? [200] : [401],
      options: { headers: authHeaders },
    });
  }
  if (personId && treeId) {
    await runCheck(results, {
      group: "user",
      method: "GET",
      path: `/my/people/${personId}`,
      expected: adminToken ? [200] : [401],
      options: { headers: authHeaders },
    });
    await runCheck(results, {
      group: "user",
      method: "PUT",
      path: `/my/trees/${treeId}/people/${personId}`,
      expected: adminToken ? [200, 400] : [401],
      options: { headers: authHeaders, body: { name: "Audit Person Updated" } },
    });
  }

  await runCheck(results, {
    group: "user",
    method: "GET",
    path: "/my/books",
    expected: adminToken ? [200] : [401],
    options: { headers: authHeaders },
  });
  if (bookId) {
    await runCheck(results, {
      group: "user",
      method: "GET",
      path: `/my/books/${bookId}`,
      expected: adminToken ? [200] : [401],
      options: { headers: authHeaders },
    });
    await runCheck(results, {
      group: "user",
      method: "GET",
      path: `/my/books/${bookId}/download`,
      expected: adminToken ? [200] : [401],
      options: { headers: authHeaders },
    });
  }

  await runCheck(results, {
    group: "user",
    method: "GET",
    path: "/my/gallery",
    expected: adminToken ? [200] : [401],
    options: { headers: authHeaders },
  });
  if (galleryId) {
    await runCheck(results, {
      group: "user",
      method: "GET",
      path: `/my/gallery/${galleryId}`,
      expected: adminToken ? [200] : [401],
      options: { headers: authHeaders },
    });
    await runCheck(results, {
      group: "user",
      method: "POST",
      path: `/my/gallery/${galleryId}/save`,
      expected: adminToken ? [200, 201, 400] : [401],
      options: {
        headers: authHeaders,
        body: { title: "Audit Gallery Saved", isPublic: true },
      },
    });
  }

  await runCheck(results, {
    group: "user",
    method: "POST",
    path: "/user/requests/password-reset",
    expected: adminToken ? [200, 201, 409, 400] : [401],
    options: { headers: authHeaders, body: {} },
  });
  await runCheck(results, {
    group: "user",
    method: "POST",
    path: "/user/requests/account-deletion",
    expected: adminToken ? [200, 201, 409, 400] : [401],
    options: { headers: authHeaders, body: { reason: "Audit request" } },
  });

  await runCheck(results, {
    group: "admin",
    method: "GET",
    path: "/admin/users",
    expected: adminToken ? [200] : [401, 403],
    options: { headers: authHeaders },
  });
  if (createdUserId) {
    await runCheck(results, {
      group: "admin",
      method: "GET",
      path: `/admin/users/${createdUserId}`,
      expected: adminToken ? [200] : [401, 403],
      options: { headers: authHeaders },
    });
    await runCheck(results, {
      group: "admin",
      method: "PATCH",
      path: `/admin/users/${createdUserId}`,
      expected: adminToken ? [200, 400] : [401, 403],
      options: {
        headers: authHeaders,
        body: { full_name: "Audit User Updated" },
      },
    });
  }

  await runCheck(results, {
    group: "admin",
    method: "GET",
    path: "/admin/admins",
    expected: adminToken ? [200, 403] : [401, 403],
    options: { headers: authHeaders },
  });
  await runCheck(results, {
    group: "admin",
    method: "GET",
    path: "/admin/trees",
    expected: adminToken ? [200] : [401, 403],
    options: { headers: authHeaders },
  });
  if (treeId) {
    await runCheck(results, {
      group: "admin",
      method: "GET",
      path: `/admin/trees/${treeId}`,
      expected: adminToken ? [200] : [401, 403],
      options: { headers: authHeaders },
    });
    await runCheck(results, {
      group: "admin",
      method: "GET",
      path: `/admin/trees/${treeId}/gedcom`,
      expected: adminToken ? [200, 404] : [401, 403],
      options: { headers: authHeaders },
      note: "GEDCOM download depends on uploaded file presence",
    });
  }

  await runCheck(results, {
    group: "admin",
    method: "GET",
    path: "/admin/books",
    expected: adminToken ? [200] : [401, 403],
    options: { headers: authHeaders },
  });
  if (bookId) {
    await runCheck(results, {
      group: "admin",
      method: "GET",
      path: `/admin/books/${bookId}`,
      expected: adminToken ? [200] : [401, 403],
      options: { headers: authHeaders },
    });
  }

  await runCheck(results, {
    group: "admin",
    method: "GET",
    path: "/admin/gallery",
    expected: adminToken ? [200] : [401, 403],
    options: { headers: authHeaders },
  });
  if (galleryId) {
    await runCheck(results, {
      group: "admin",
      method: "GET",
      path: `/admin/gallery/${galleryId}`,
      expected: adminToken ? [200] : [401, 403],
      options: { headers: authHeaders },
    });
  }

  await runCheck(results, {
    group: "admin",
    method: "GET",
    path: "/activity",
    expected: adminToken ? [200] : [401, 403],
    options: { headers: authHeaders },
  });
  await runCheck(results, {
    group: "admin",
    method: "GET",
    path: "/admin/contact/messages",
    expected: adminToken ? [200] : [401, 403],
    options: { headers: authHeaders },
  });
  await runCheck(results, {
    group: "admin",
    method: "GET",
    path: "/admin/newsletter/subscribers",
    expected: adminToken ? [200] : [401, 403],
    options: { headers: authHeaders },
  });
  await runCheck(results, {
    group: "admin",
    method: "GET",
    path: "/admin/approvals/stats",
    expected: adminToken ? [200, 403] : [401, 403],
    options: { headers: authHeaders },
  });
  await runCheck(results, {
    group: "admin",
    method: "GET",
    path: "/admin/approvals/password-reset",
    expected: adminToken ? [200, 403] : [401, 403],
    options: { headers: authHeaders },
  });
  await runCheck(results, {
    group: "admin",
    method: "GET",
    path: "/admin/approvals/account-deletion",
    expected: adminToken ? [200, 403] : [401, 403],
    options: { headers: authHeaders },
  });

  await runCheck(results, {
    group: "public-write",
    method: "POST",
    path: "/newsletter/subscribe",
    expected: [200, 201, 409, 400],
    options: {
      body: { email: `newsletter_${Date.now()}@test.rootsegypt.org` },
    },
  });
  await runCheck(results, {
    group: "public-write",
    method: "POST",
    path: "/contact",
    expected: [200, 201, 400],
    options: {
      body: {
        name: "Audit",
        email: "audit@test.rootsegypt.org",
        message: "Route audit message",
      },
    },
  });

  if (createdUserId && adminToken) {
    await runCheck(results, {
      group: "cleanup",
      method: "DELETE",
      path: `/admin/users/${createdUserId}`,
      expected: [200],
      options: { headers: authHeaders },
      note: "Cleanup",
    });
  }
  if (galleryId && adminToken) {
    await runCheck(results, {
      group: "cleanup",
      method: "DELETE",
      path: `/my/gallery/${galleryId}`,
      expected: [200],
      options: { headers: authHeaders },
      note: "Cleanup",
    });
  }
  if (bookId && adminToken) {
    await runCheck(results, {
      group: "cleanup",
      method: "DELETE",
      path: `/my/books/${bookId}`,
      expected: [200],
      options: { headers: authHeaders },
      note: "Cleanup",
    });
  }
  if (treeId && adminToken) {
    await runCheck(results, {
      group: "cleanup",
      method: "DELETE",
      path: `/my/trees/${treeId}`,
      expected: [200],
      options: { headers: authHeaders },
      note: "Cleanup",
    });
  }

  if (adminToken) {
    await runCheck(results, {
      group: "auth",
      method: "POST",
      path: "/auth/logout",
      expected: [200],
      options: { headers: authHeaders, body: {} },
    });
  }

  writeReport(results);

  const passed = results.filter((row) => row.ok).length;
  const failed = results.length - passed;

  console.log(`\nReport written to ${REPORT_DIR}`);
  console.log(`${passed}/${results.length} checks passed.`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});
