#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

if (typeof fetch === "undefined") {
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

function ensureSafeTarget() {
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(SERVER);
  if (!isLocal && !ALLOW_REMOTE) {
    console.error(
      "ERROR: Remote audit target blocked. Set AUDIT_ALLOW_REMOTE=true to audit a non-local API.",
    );
    process.exit(1);
  }
}

function toStatusSet(statuses) {
  return Array.isArray(statuses) ? statuses : [statuses];
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function request(method, routePath, options = {}) {
  const url = `${BASE}${routePath}`;
  const headers = { Accept: "application/json", ...(options.headers || {}) };
  const init = {
    method,
    headers,
  };

  if (options.body !== undefined) {
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
    errorMessage,
  };
}

async function runCheck(results, config) {
  const expectedStatuses = toStatusSet(config.expectedStatuses);
  const response = await request(config.method, config.path, config.options);
  const matched = expectedStatuses.includes(response.status);
  const note =
    response.errorMessage ||
    config.note ||
    (response.body ? response.body.slice(0, 180) : "");

  results.push({
    group: config.group,
    method: config.method,
    path: config.path,
    label: `${config.method} ${config.path}`,
    status: response.status,
    expectedStatuses,
    ms: response.ms,
    ok: matched,
    note,
    url: response.url,
  });

  const icon = matched ? "[OK]" : "[FAIL]";
  console.log(
    `${icon} ${String(response.status).padStart(3)} ${String(response.ms).padStart(5)}ms ${config.method.padEnd(6)} ${config.path}`,
  );
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
          <td class="${statusClass}">${escapeHtml(row.status || "ERR")}</td>
          <td>${escapeHtml(row.expectedStatuses.join(", "))}</td>
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
      --accent: #c98c2f;
      --ok: #0f766e;
      --ok-bg: rgba(15,118,110,0.12);
      --fail: #b42318;
      --fail-bg: rgba(180,35,24,0.12);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Segoe UI", Manrope, Arial, sans-serif;
      background:
        linear-gradient(180deg, rgba(247,242,232,0.96), rgba(247,242,232,0.96)),
        radial-gradient(circle at top left, rgba(12,74,110,0.18), transparent 35%);
      color: var(--ink);
    }
    .wrap {
      max-width: 1440px;
      margin: 0 auto;
      padding: 40px 24px 64px;
    }
    .hero {
      background: linear-gradient(135deg, rgba(12,74,110,0.97), rgba(18,32,51,0.96));
      color: white;
      border-radius: 28px;
      padding: 28px 28px 22px;
      box-shadow: 0 24px 70px rgba(18,32,51,0.18);
      margin-bottom: 24px;
    }
    .eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.28em;
      font-size: 12px;
      color: rgba(255,255,255,0.72);
      margin: 0 0 10px;
    }
    h1 {
      margin: 0 0 10px;
      font-size: clamp(30px, 5vw, 48px);
      line-height: 1.05;
    }
    .meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 14px;
      margin-top: 22px;
    }
    .meta-card, .summary-card {
      background: var(--panel);
      border: 1px solid rgba(216,199,176,0.72);
      border-radius: 22px;
      padding: 18px 18px 16px;
      backdrop-filter: blur(10px);
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 14px;
      margin-bottom: 20px;
    }
    .summary-card strong, .meta-card strong {
      display: block;
      font-size: 28px;
      margin-top: 6px;
    }
    .summary-card span, .meta-card span {
      color: var(--muted);
      font-size: 13px;
      letter-spacing: 0.03em;
    }
    .table-shell {
      background: var(--panel);
      border: 1px solid rgba(216,199,176,0.72);
      border-radius: 26px;
      padding: 18px;
      overflow: hidden;
      box-shadow: 0 18px 55px rgba(18,32,51,0.08);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    th, td {
      padding: 14px 12px;
      border-bottom: 1px solid rgba(216,199,176,0.72);
      vertical-align: top;
      text-align: left;
    }
    th {
      font-size: 12px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--muted);
      background: rgba(12,74,110,0.04);
    }
    tr:last-child td { border-bottom: none; }
    code {
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: 12.5px;
      color: var(--brand);
      white-space: nowrap;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 7px 11px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.03em;
    }
    .badge.ok {
      color: var(--ok);
      background: var(--ok-bg);
    }
    .badge.fail {
      color: var(--fail);
      background: var(--fail-bg);
    }
    .ok-text { color: var(--ok); font-weight: 700; }
    .fail-text { color: var(--fail); font-weight: 700; }
    .footnote {
      color: var(--muted);
      font-size: 13px;
      margin-top: 16px;
      line-height: 1.6;
    }
    @media (max-width: 860px) {
      .wrap { padding: 18px 14px 42px; }
      .hero, .table-shell { border-radius: 20px; }
      table { display: block; overflow-x: auto; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <section class="hero">
      <p class="eyebrow">Roots Egypt Deployment Audit</p>
      <h1>Route status report</h1>
      <p>This report captures backend route health as observed by the audit script, including expected statuses, response timing, and a green-check verdict per route.</p>
      <div class="meta">
        <div class="meta-card">
          <span>Target base URL</span>
          <strong>${escapeHtml(metadata.base)}</strong>
        </div>
        <div class="meta-card">
          <span>Server origin</span>
          <strong>${escapeHtml(metadata.server)}</strong>
        </div>
        <div class="meta-card">
          <span>Generated</span>
          <strong>${escapeHtml(metadata.generatedAt)}</strong>
        </div>
      </div>
    </section>

    <section class="summary">
      <div class="summary-card">
        <span>Total checks</span>
        <strong>${escapeHtml(metadata.total)}</strong>
      </div>
      <div class="summary-card">
        <span>Passed</span>
        <strong class="ok-text">${escapeHtml(metadata.passed)}</strong>
      </div>
      <div class="summary-card">
        <span>Failed</span>
        <strong class="fail-text">${escapeHtml(metadata.failed)}</strong>
      </div>
      <div class="summary-card">
        <span>Average response time</span>
        <strong>${escapeHtml(`${metadata.avgMs} ms`)}</strong>
      </div>
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
      <p class="footnote">Green checks mean the route returned one of the expected statuses for that test scenario. Protected routes may pass with <code>401</code> or <code>403</code> when the audit intentionally verifies guard behavior without a valid token.</p>
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
    ? Math.round(results.reduce((sum, row) => sum + row.ms, 0) / results.length)
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

async function main() {
  ensureSafeTarget();

  const results = [];
  const unauthHeaders = {};

  const adminLogin = await request("POST", "/auth/login", {
    body: { email: AUDIT_EMAIL, password: AUDIT_PASSWORD },
  });
  let adminToken = "";
  try {
    const parsed = adminLogin.body ? JSON.parse(adminLogin.body) : null;
    adminToken =
      parsed?.data?.token || parsed?.token || parsed?.accessToken || "";
  } catch {
    adminToken = "";
  }

  const authHeaders = adminToken
    ? { Authorization: `Bearer ${adminToken}` }
    : unauthHeaders;

  console.log(`Auditing ${BASE}`);
  console.log(
    `Auth mode: ${adminToken ? "admin-token" : "guest-route-surface"}\n`,
  );

  const checks = [
    { group: "health", method: "GET", path: "/health/live", expectedStatuses: [200] },
    { group: "health", method: "GET", path: "/health", expectedStatuses: [200, 503] },
    { group: "health", method: "GET", path: "/db-health", expectedStatuses: [200, 503] },
    { group: "health", method: "GET", path: "/health/db-diag", expectedStatuses: [200, 403] },
    { group: "stats", method: "GET", path: "/admin/stats", expectedStatuses: adminToken ? [200, 403] : [401, 403], options: { headers: authHeaders } },
    { group: "search", method: "GET", path: "/search?q=roots", expectedStatuses: [200] },
    { group: "search", method: "GET", path: "/search/suggest?q=roots", expectedStatuses: [200] },
    { group: "public", method: "GET", path: "/trees", expectedStatuses: [200] },
    { group: "public", method: "GET", path: "/trees/1", expectedStatuses: [200, 404] },
    { group: "public", method: "GET", path: "/trees/1/gedcom", expectedStatuses: [200, 404] },
    { group: "public", method: "GET", path: "/trees/1/people", expectedStatuses: [200, 404] },
    { group: "public", method: "GET", path: "/people/1", expectedStatuses: [200, 404] },
    { group: "public", method: "GET", path: "/books", expectedStatuses: [200] },
    { group: "public", method: "GET", path: "/books/1", expectedStatuses: [200, 404] },
    { group: "public", method: "GET", path: "/books/1/download", expectedStatuses: [200, 404] },
    { group: "public", method: "GET", path: "/gallery", expectedStatuses: [200] },
    { group: "public", method: "GET", path: "/gallery/1", expectedStatuses: [200, 404] },
    { group: "auth", method: "POST", path: "/auth/login", expectedStatuses: [200], options: { body: { email: AUDIT_EMAIL, password: AUDIT_PASSWORD } } },
    { group: "auth", method: "POST", path: "/auth/login", expectedStatuses: [400, 401], options: { body: { email: AUDIT_EMAIL, password: "wrong-password-for-audit" } }, note: "Intentional bad password check" },
    { group: "auth", method: "POST", path: "/auth/signup", expectedStatuses: [200, 201, 409], options: { body: { email: `audit_${Date.now()}@test.rootsegypt.org`, password: "Audit1234!", full_name: "Audit Route Check" } } },
    { group: "auth", method: "POST", path: "/auth/refresh", expectedStatuses: [400, 401], options: { body: { refreshToken: "invalid-refresh-token" } } },
    { group: "auth", method: "POST", path: "/auth/reset", expectedStatuses: [200], options: { body: { email: "nobody@rootsegypt.org" } } },
    { group: "auth", method: "POST", path: "/auth/reset/token", expectedStatuses: [400, 404], options: { body: { token: "invalid-token", password: "Audit1234!" } } },
    { group: "auth", method: "POST", path: "/auth/reset/verify", expectedStatuses: [400, 404], options: { body: { email: "nobody@rootsegypt.org", code: "000000" } } },
    { group: "auth", method: "GET", path: "/auth/me", expectedStatuses: adminToken ? [200] : [401], options: { headers: authHeaders } },
    { group: "auth", method: "PATCH", path: "/auth/me", expectedStatuses: adminToken ? [200, 400] : [401], options: { headers: authHeaders, body: { full_name: "Audit Name" } } },
    { group: "auth", method: "POST", path: "/auth/logout", expectedStatuses: adminToken ? [200] : [401], options: { headers: authHeaders, body: {} } },
    { group: "user", method: "GET", path: "/my/trees", expectedStatuses: adminToken ? [200] : [401], options: { headers: authHeaders } },
    { group: "user", method: "GET", path: "/my/trees/1", expectedStatuses: adminToken ? [200, 403, 404] : [401], options: { headers: authHeaders } },
    { group: "user", method: "POST", path: "/my/trees", expectedStatuses: adminToken ? [200, 201, 400] : [401], options: { headers: authHeaders, body: { title: "Audit Tree" } } },
    { group: "user", method: "PUT", path: "/my/trees/1", expectedStatuses: adminToken ? [200, 400, 403, 404] : [401], options: { headers: authHeaders, body: { title: "Audit Tree Updated" } } },
    { group: "user", method: "POST", path: "/my/trees/1/save", expectedStatuses: adminToken ? [200, 400, 403, 404] : [401], options: { headers: authHeaders, body: { title: "Audit Tree Saved" } } },
    { group: "user", method: "DELETE", path: "/my/trees/1", expectedStatuses: adminToken ? [200, 403, 404] : [401], options: { headers: authHeaders } },
    { group: "user", method: "GET", path: "/my/trees/1/gedcom", expectedStatuses: adminToken ? [200, 403, 404] : [401], options: { headers: authHeaders } },
    { group: "user", method: "GET", path: "/my/trees/1/people", expectedStatuses: adminToken ? [200, 403, 404] : [401], options: { headers: authHeaders } },
    { group: "user", method: "GET", path: "/my/people/1", expectedStatuses: adminToken ? [200, 403, 404] : [401], options: { headers: authHeaders } },
    { group: "user", method: "POST", path: "/my/trees/1/people", expectedStatuses: adminToken ? [200, 201, 400, 403, 404] : [401], options: { headers: authHeaders, body: { name: "Audit Person" } } },
    { group: "user", method: "PUT", path: "/my/trees/1/people/1", expectedStatuses: adminToken ? [200, 400, 403, 404] : [401], options: { headers: authHeaders, body: { name: "Audit Person Updated" } } },
    { group: "user", method: "DELETE", path: "/my/trees/1/people/1", expectedStatuses: adminToken ? [200, 403, 404] : [401], options: { headers: authHeaders } },
    { group: "user", method: "GET", path: "/my/books", expectedStatuses: adminToken ? [200] : [401], options: { headers: authHeaders } },
    { group: "user", method: "GET", path: "/my/books/1", expectedStatuses: adminToken ? [200, 403, 404] : [401], options: { headers: authHeaders } },
    { group: "user", method: "POST", path: "/my/books", expectedStatuses: adminToken ? [200, 201, 400] : [401], options: { headers: authHeaders, body: { title: "Audit Book" } } },
    { group: "user", method: "PUT", path: "/my/books/1", expectedStatuses: adminToken ? [200, 400, 403, 404] : [401], options: { headers: authHeaders, body: { title: "Audit Book Updated" } } },
    { group: "user", method: "DELETE", path: "/my/books/1", expectedStatuses: adminToken ? [200, 403, 404] : [401], options: { headers: authHeaders } },
    { group: "user", method: "GET", path: "/my/books/1/download", expectedStatuses: adminToken ? [200, 403, 404] : [401], options: { headers: authHeaders } },
    { group: "user", method: "GET", path: "/my/gallery", expectedStatuses: adminToken ? [200] : [401], options: { headers: authHeaders } },
    { group: "user", method: "GET", path: "/my/gallery/1", expectedStatuses: adminToken ? [200, 403, 404] : [401], options: { headers: authHeaders } },
    { group: "user", method: "POST", path: "/my/gallery", expectedStatuses: adminToken ? [200, 201, 400] : [401], options: { headers: authHeaders, body: { title: "Audit Gallery Item" } } },
    { group: "user", method: "POST", path: "/my/gallery/1/save", expectedStatuses: adminToken ? [200, 400, 403, 404] : [401], options: { headers: authHeaders, body: { title: "Audit Gallery Saved" } } },
    { group: "user", method: "PUT", path: "/my/gallery/1", expectedStatuses: adminToken ? [200, 400, 403, 404] : [401], options: { headers: authHeaders, body: { title: "Audit Gallery Updated" } } },
    { group: "user", method: "DELETE", path: "/my/gallery/1", expectedStatuses: adminToken ? [200, 403, 404] : [401], options: { headers: authHeaders } },
    { group: "user", method: "POST", path: "/user/requests/password-reset", expectedStatuses: adminToken ? [200, 201, 409, 400] : [401], options: { headers: authHeaders, body: {} } },
    { group: "user", method: "POST", path: "/user/requests/account-deletion", expectedStatuses: adminToken ? [200, 201, 409, 400] : [401], options: { headers: authHeaders, body: { reason: "Audit request" } } },
    { group: "admin", method: "GET", path: "/admin/users", expectedStatuses: adminToken ? [200] : [401, 403], options: { headers: authHeaders } },
    { group: "admin", method: "GET", path: "/admin/users/1", expectedStatuses: adminToken ? [200, 404] : [401, 403], options: { headers: authHeaders } },
    { group: "admin", method: "POST", path: "/admin/users", expectedStatuses: adminToken ? [200, 201, 400] : [401, 403], options: { headers: authHeaders, body: { email: `route_user_${Date.now()}@test.rootsegypt.org`, password: "Audit1234!", full_name: "Audit Admin User" } } },
    { group: "admin", method: "PATCH", path: "/admin/users/1", expectedStatuses: adminToken ? [200, 400, 404] : [401, 403], options: { headers: authHeaders, body: { full_name: "Audit User Updated" } } },
    { group: "admin", method: "DELETE", path: "/admin/users/1", expectedStatuses: adminToken ? [200, 404] : [401, 403], options: { headers: authHeaders } },
    { group: "admin", method: "GET", path: "/admin/admins", expectedStatuses: adminToken ? [200, 403] : [401, 403], options: { headers: authHeaders } },
    { group: "admin", method: "POST", path: "/admin/admins", expectedStatuses: adminToken ? [200, 201, 400, 403] : [401, 403], options: { headers: authHeaders, body: { email: `route_admin_${Date.now()}@test.rootsegypt.org`, password: "Audit1234!", full_name: "Audit Admin" } } },
    { group: "admin", method: "PATCH", path: "/admin/admins/1", expectedStatuses: adminToken ? [200, 400, 403, 404] : [401, 403], options: { headers: authHeaders, body: { full_name: "Audit Admin Updated" } } },
    { group: "admin", method: "DELETE", path: "/admin/admins/1", expectedStatuses: adminToken ? [200, 403, 404] : [401, 403], options: { headers: authHeaders } },
    { group: "admin", method: "GET", path: "/admin/trees", expectedStatuses: adminToken ? [200] : [401, 403], options: { headers: authHeaders } },
    { group: "admin", method: "GET", path: "/admin/trees/1", expectedStatuses: adminToken ? [200, 404] : [401, 403], options: { headers: authHeaders } },
    { group: "admin", method: "GET", path: "/admin/trees/1/gedcom", expectedStatuses: adminToken ? [200, 404] : [401, 403], options: { headers: authHeaders } },
    { group: "admin", method: "POST", path: "/admin/trees", expectedStatuses: adminToken ? [200, 201, 400] : [401, 403], options: { headers: authHeaders, body: { title: "Audit Admin Tree" } } },
    { group: "admin", method: "POST", path: "/admin/trees/1/save", expectedStatuses: adminToken ? [200, 400, 404] : [401, 403], options: { headers: authHeaders, body: { title: "Audit Admin Tree Saved" } } },
    { group: "admin", method: "PUT", path: "/admin/trees/1", expectedStatuses: adminToken ? [200, 400, 404] : [401, 403], options: { headers: authHeaders, body: { title: "Audit Admin Tree Updated" } } },
    { group: "admin", method: "DELETE", path: "/admin/trees/1", expectedStatuses: adminToken ? [200, 404] : [401, 403], options: { headers: authHeaders } },
    { group: "admin", method: "GET", path: "/admin/books", expectedStatuses: adminToken ? [200] : [401, 403], options: { headers: authHeaders } },
    { group: "admin", method: "GET", path: "/admin/books/1", expectedStatuses: adminToken ? [200, 404] : [401, 403], options: { headers: authHeaders } },
    { group: "admin", method: "POST", path: "/admin/books", expectedStatuses: adminToken ? [200, 201, 400] : [401, 403], options: { headers: authHeaders, body: { title: "Audit Admin Book" } } },
    { group: "admin", method: "PUT", path: "/admin/books/1", expectedStatuses: adminToken ? [200, 400, 404] : [401, 403], options: { headers: authHeaders, body: { title: "Audit Admin Book Updated" } } },
    { group: "admin", method: "DELETE", path: "/admin/books/1", expectedStatuses: adminToken ? [200, 404] : [401, 403], options: { headers: authHeaders } },
    { group: "admin", method: "GET", path: "/admin/gallery", expectedStatuses: adminToken ? [200] : [401, 403], options: { headers: authHeaders } },
    { group: "admin", method: "GET", path: "/admin/gallery/1", expectedStatuses: adminToken ? [200, 404] : [401, 403], options: { headers: authHeaders } },
    { group: "admin", method: "POST", path: "/admin/gallery", expectedStatuses: adminToken ? [200, 201, 400] : [401, 403], options: { headers: authHeaders, body: { title: "Audit Admin Gallery Item" } } },
    { group: "admin", method: "POST", path: "/admin/gallery/1/save", expectedStatuses: adminToken ? [200, 400, 404] : [401, 403], options: { headers: authHeaders, body: { title: "Audit Admin Gallery Saved" } } },
    { group: "admin", method: "PUT", path: "/admin/gallery/1", expectedStatuses: adminToken ? [200, 400, 404] : [401, 403], options: { headers: authHeaders, body: { title: "Audit Admin Gallery Updated" } } },
    { group: "admin", method: "DELETE", path: "/admin/gallery/1", expectedStatuses: adminToken ? [200, 404] : [401, 403], options: { headers: authHeaders } },
    { group: "admin", method: "GET", path: "/activity", expectedStatuses: adminToken ? [200] : [401, 403], options: { headers: authHeaders } },
    { group: "admin", method: "GET", path: "/admin/contact/messages", expectedStatuses: adminToken ? [200] : [401, 403], options: { headers: authHeaders } },
    { group: "admin", method: "GET", path: "/admin/newsletter/subscribers", expectedStatuses: adminToken ? [200] : [401, 403], options: { headers: authHeaders } },
    { group: "admin", method: "GET", path: "/admin/approvals/stats", expectedStatuses: adminToken ? [200, 403] : [401, 403], options: { headers: authHeaders } },
    { group: "admin", method: "GET", path: "/admin/approvals/password-reset", expectedStatuses: adminToken ? [200, 403] : [401, 403], options: { headers: authHeaders } },
    { group: "admin", method: "PUT", path: "/admin/approvals/password-reset/1/approve", expectedStatuses: adminToken ? [200, 403, 404] : [401, 403], options: { headers: authHeaders } },
    { group: "admin", method: "PUT", path: "/admin/approvals/password-reset/1/reject", expectedStatuses: adminToken ? [200, 403, 404] : [401, 403], options: { headers: authHeaders } },
    { group: "admin", method: "GET", path: "/admin/approvals/account-deletion", expectedStatuses: adminToken ? [200, 403] : [401, 403], options: { headers: authHeaders } },
    { group: "admin", method: "PUT", path: "/admin/approvals/account-deletion/1/approve", expectedStatuses: adminToken ? [200, 403, 404] : [401, 403], options: { headers: authHeaders } },
    { group: "admin", method: "PUT", path: "/admin/approvals/account-deletion/1/reject", expectedStatuses: adminToken ? [200, 403, 404] : [401, 403], options: { headers: authHeaders } },
    { group: "public-write", method: "POST", path: "/newsletter/subscribe", expectedStatuses: [200, 201, 409, 400], options: { body: { email: `newsletter_${Date.now()}@test.rootsegypt.org` } } },
    { group: "public-write", method: "POST", path: "/contact", expectedStatuses: [200, 201, 400], options: { body: { name: "Audit", email: "audit@test.rootsegypt.org", message: "Route audit message" } } },
  ];

  for (const check of checks) {
    await runCheck(results, check);
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
