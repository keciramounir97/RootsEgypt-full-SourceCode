/**
 * ROOTS EGYPT — Mock API Adapter
 *
 * Intercepts Axios requests and returns realistic mock data.
 * Activated when MOCK_MODE is enabled (default in dev without backend).
 *
 * To use your real backend:
 *   localStorage.setItem("rootsegypt_mock_mode", "false")
 *   and reload the page.
 */

import type { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import {
  MOCK_USERS,
  MOCK_TOKEN,
  MOCK_REFRESH_TOKEN,
  MOCK_TREES,
  MOCK_BOOKS,
  MOCK_GALLERY,
  MOCK_STATS,
  MOCK_ACTIVITY,
  MOCK_USERS_LIST,
  MOCK_NOTIFICATIONS,
  MOCK_ROLES,
  MOCK_SEARCH_TREES,
  MOCK_SEARCH_PEOPLE,
  MOCK_AUDIO,
  MOCK_CONTACT_SUBMISSIONS,
  MOCK_RESEARCH_RESOURCES,
  MOCK_PERIODS,
} from "./mockData";

// ── State ──────────────────────────────────────────────────────────────
const MOCK_MODE_KEY = "rootsegypt_mock_mode";
const MOCK_USER_KEY = "rootsegypt_mock_logged_user";

export function isMockMode(): boolean {
  return false;
}

export function setMockMode(enabled: boolean): void {
  localStorage.setItem(MOCK_MODE_KEY, String(enabled));
}

function getLoggedUser() {
  const raw = localStorage.getItem(MOCK_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setLoggedUser(user: any) {
  localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
}

// ── Helpers ────────────────────────────────────────────────────────────
const delay = (ms = 180) =>
  new Promise<void>((r) => setTimeout(r, ms + Math.random() * 120));

function makeResponse(
  data: any,
  config: InternalAxiosRequestConfig,
  status = 200,
): AxiosResponse {
  return {
    data,
    status,
    statusText: status === 200 ? "OK" : status === 201 ? "Created" : "OK",
    headers: { "content-type": "application/json" },
    config,
    request: {},
  };
}

function makeError(message: string, status: number) {
  const err: any = new Error(message);
  err.response = { data: { message }, status, statusText: message };
  err.userMessage = message;
  return err;
}

// ── Router ─────────────────────────────────────────────────────────────
export async function mockAdapter(
  config: InternalAxiosRequestConfig,
): Promise<AxiosResponse> {
  await delay();

  const method = (config.method || "get").toLowerCase();
  const url = String(config.url || "");

  // Normalize URL: strip query string for matching
  const path = url.split("?")[0];

  // ── AUTH ──────────────────────────────────────────────────────────
  if (method === "post" && path.includes("/login")) {
    let body: any = {};
    try {
      body =
        typeof config.data === "string"
          ? JSON.parse(config.data)
          : config.data || {};
    } catch {
      /* */
    }
    const email = String(body.email || "")
      .toLowerCase()
      .trim();
    const password = String(body.password || "");

    // Accept any credential — try to match known users first
    let user = MOCK_USERS.find(
      (u) => u.email === email && u.password === password,
    );

    // Fallback: accept any email/password and return a demo member user
    if (!user) {
      user = {
        id: 99,
        email,
        password,
        fullName: email
          .split("@")[0]
          .replace(/[._]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        phone: "",
        role: 2,
        roleName: "Member",
        status: "active",
        permissions: [],
      };
    }

    const { password: _pw, ...safeUser } = user as any;
    setLoggedUser(safeUser);
    localStorage.setItem("token", MOCK_TOKEN);
    localStorage.setItem("refreshToken", MOCK_REFRESH_TOKEN);

    return makeResponse(
      { token: MOCK_TOKEN, refreshToken: MOCK_REFRESH_TOKEN, user: safeUser },
      config,
    );
  }

  if (method === "post" && path.includes("/signup")) {
    let body: any = {};
    try {
      body =
        typeof config.data === "string"
          ? JSON.parse(config.data)
          : config.data || {};
    } catch {
      /* */
    }
    const newUser = {
      id: Math.floor(Math.random() * 9000) + 1000,
      email: String(body.email || ""),
      fullName: String(body.fullName || "New User"),
      phone: String(body.phone || ""),
      role: 2,
      roleName: "Member",
      status: "active",
    };
    setLoggedUser(newUser);
    localStorage.setItem("token", MOCK_TOKEN);
    localStorage.setItem("refreshToken", MOCK_REFRESH_TOKEN);
    return makeResponse(
      {
        message: "Account created successfully.",
        user: newUser,
        token: MOCK_TOKEN,
        refreshToken: MOCK_REFRESH_TOKEN,
      },
      config,
      201,
    );
  }

  if (method === "get" && path.includes("/me")) {
    const user = getLoggedUser();
    if (!user) {
      throw makeError("Unauthorized", 401);
    }
    return makeResponse(user, config);
  }

  if (method === "post" && path.includes("/logout")) {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem(MOCK_USER_KEY);
    return makeResponse({ message: "Logged out." }, config);
  }

  if (method === "post" && path.includes("/reset/verify")) {
    return makeResponse({ message: "Password reset successfully." }, config);
  }

  if (method === "post" && path.includes("/reset")) {
    return makeResponse(
      { message: "If this email exists, a reset code has been sent." },
      config,
    );
  }

  if (method === "post" && path.includes("/refresh")) {
    const user = getLoggedUser();
    return makeResponse(
      { token: MOCK_TOKEN, refreshToken: MOCK_REFRESH_TOKEN, user },
      config,
    );
  }

  // ── TREES — GEDCOM (must be before general tree routes) ───────────
  if (method === "get" && /\/(admin\/trees|my\/trees|trees)\/(\d+)\/gedcom/.test(path)) {
    const match = path.match(/\/(\d+)\/gedcom/);
    const id = parseInt(match![1], 10);
    const tree = MOCK_TREES.find((t) => t.id === id);
    if (!tree || !tree.gedcom) throw makeError("GEDCOM not found", 404);
    return {
      data: tree.gedcom,
      status: 200,
      statusText: "OK",
      headers: { "content-type": "text/plain" },
      config,
      request: {},
    };
  }

  // ── TREES ─────────────────────────────────────────────────────────
  if (method === "get" && /\/my\/trees/.test(path)) {
    const user = getLoggedUser();
    const myTrees = MOCK_TREES.filter(
      (t) => !user || t.owner === user.email || t.id <= 3
    );
    return makeResponse(myTrees, config);
  }

  if (method === "get" && /\/admin\/trees/.test(path)) {
    return makeResponse(MOCK_TREES, config);
  }

  if (method === "get" && /\/trees\/(\d+)$/.test(path)) {
    const match = path.match(/\/trees\/(\d+)$/);
    const id = parseInt(match![1], 10);
    const tree = MOCK_TREES.find((t) => t.id === id);
    if (!tree) throw makeError("Tree not found", 404);
    return makeResponse(tree, config);
  }

  if (method === "get" && /\/trees$/.test(path)) {
    return makeResponse(MOCK_TREES, config);
  }

  if (method === "post" && /\/my\/trees$/.test(path)) {
    let body: any = {};
    try {
      body = typeof config.data === "string" ? JSON.parse(config.data) : config.data || {};
    } catch { /* */ }
    const newTree = { ...body, id: Date.now(), createdAt: new Date().toISOString(), isPublic: true, hasGedcom: false };
    return makeResponse(newTree, config, 201);
  }

  if (method === "post" && /\/trees$/.test(path)) {
    let body: any = {};
    try {
      body = typeof config.data === "string" ? JSON.parse(config.data) : config.data || {};
    } catch { /* */ }
    const newTree = { ...body, id: Date.now(), createdAt: new Date().toISOString(), isPublic: true, hasGedcom: false };
    return makeResponse(newTree, config, 201);
  }

  if (method === "put" && /\/(my\/)?trees\/\d+/.test(path)) {
    return makeResponse({ message: "Tree updated." }, config);
  }

  if (method === "post" && /\/(my\/)?trees\/\d+\/save/.test(path)) {
    return makeResponse({ message: "Tree saved." }, config);
  }

  if (method === "delete" && /\/trees\/\d+$/.test(path)) {
    return makeResponse({ message: "Tree deleted." }, config);
  }

  // ── GALLERY ───────────────────────────────────────────────────────
  if (method === "get" && /\/admin\/gallery/.test(path)) {
    return makeResponse({ gallery: MOCK_GALLERY }, config);
  }

  if (method === "get" && /\/my\/gallery/.test(path)) {
    return makeResponse({ gallery: MOCK_GALLERY.slice(0, 8) }, config);
  }

  if (method === "get" && /\/gallery/.test(path)) {
    return makeResponse({ gallery: MOCK_GALLERY }, config);
  }

  if (method === "post" && /\/gallery/.test(path)) {
    return makeResponse({ message: "Image uploaded.", id: Date.now() }, config, 201);
  }

  if (method === "put" && /\/gallery\/\d+/.test(path)) {
    return makeResponse({ message: "Image updated." }, config);
  }

  if (method === "delete" && /\/gallery\/\d+/.test(path)) {
    return makeResponse({ message: "Image deleted." }, config);
  }

  // ── BOOKS ─────────────────────────────────────────────────────────
  if (method === "get" && /\/admin\/books/.test(path)) {
    return makeResponse(MOCK_BOOKS, config);
  }

  if (method === "get" && /\/my\/books/.test(path)) {
    return makeResponse(MOCK_BOOKS.slice(0, 6), config);
  }

  if (method === "get" && /\/books\/(\d+)\/download/.test(path)) {
    return makeResponse({ message: "Download started (mock mode — no actual file)." }, config);
  }

  if (method === "get" && /\/books\/(\d+)$/.test(path)) {
    const match = path.match(/\/books\/(\d+)$/);
    const id = parseInt(match![1], 10);
    const book = MOCK_BOOKS.find((b) => b.id === id);
    if (!book) throw makeError("Book not found", 404);
    return makeResponse(book, config);
  }

  if (method === "get" && /\/books$/.test(path)) {
    return makeResponse(MOCK_BOOKS, config);
  }

  if (method === "post" && /\/books$/.test(path)) {
    return makeResponse({ message: "Book added.", id: Date.now() }, config, 201);
  }

  if (method === "put" && /\/books\/\d+$/.test(path)) {
    return makeResponse({ message: "Book updated." }, config);
  }

  if (method === "delete" && /\/books\/\d+$/.test(path)) {
    return makeResponse({ message: "Book deleted." }, config);
  }

  // ── ADMIN ─────────────────────────────────────────────────────────
  if (method === "get" && /\/admin\/stats/.test(path)) {
    return makeResponse(MOCK_STATS, config);
  }

  if (method === "get" && /\/admin\/users/.test(path)) {
    return makeResponse(MOCK_USERS_LIST, config);
  }

  if (method === "put" && /\/admin\/users\/\d+/.test(path)) {
    return makeResponse({ message: "User updated." }, config);
  }

  if (method === "delete" && /\/admin\/users\/\d+/.test(path)) {
    return makeResponse({ message: "User deleted." }, config);
  }

  if (method === "post" && /\/admin\/users/.test(path)) {
    let body: any = {};
    try { body = typeof config.data === "string" ? JSON.parse(config.data) : config.data || {}; } catch { /* */ }
    return makeResponse({ id: Date.now(), ...body, status: "active" }, config, 201);
  }

  if (method === "get" && /\/admin\/roles/.test(path)) {
    return makeResponse(MOCK_ROLES, config);
  }

  // ── ACTIVITY ──────────────────────────────────────────────────────
  if (method === "get" && /\/activity/.test(path)) {
    return makeResponse(MOCK_ACTIVITY, config);
  }

  // ── NOTIFICATIONS ─────────────────────────────────────────────────
  if (method === "get" && /\/notifications/.test(path)) {
    return makeResponse(MOCK_NOTIFICATIONS, config);
  }

  if (method === "post" && /\/notifications\/\d+\/read/.test(path)) {
    return makeResponse({ message: "Notification marked as read." }, config);
  }

  if (method === "put" && /\/notifications\/read-all/.test(path)) {
    return makeResponse({ message: "All notifications marked as read." }, config);
  }

  // ── SEARCH ────────────────────────────────────────────────────────
  if (method === "get" && /\/search\/suggest/.test(path)) {
    const q = String(new URL(`http://x${url}`).searchParams.get("q") || "").toLowerCase().trim();
    const trees = q.length < 2 ? [] : MOCK_SEARCH_TREES.filter(
      (t) => t.title.toLowerCase().includes(q)
    ).slice(0, 4);
    const people = q.length < 2 ? [] : MOCK_SEARCH_PEOPLE.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.tree_title || "").toLowerCase().includes(q)
    ).slice(0, 5);
    return makeResponse({ trees, people }, config);
  }

  if (method === "get" && /\/search/.test(path)) {
    return makeResponse({ trees: MOCK_SEARCH_TREES, people: MOCK_SEARCH_PEOPLE, total: MOCK_SEARCH_TREES.length + MOCK_SEARCH_PEOPLE.length }, config);
  }

  // ── SOCIAL ────────────────────────────────────────────────────────
  if (method === "post" && /\/social\/.*\/like/.test(path)) {
    return makeResponse({ liked: true, count: Math.floor(Math.random() * 100) + 1 }, config);
  }

  if (method === "get" && /\/social\/.*\/comments/.test(path)) {
    return makeResponse([], config);
  }

  if (method === "post" && /\/social\/.*\/comments/.test(path)) {
    return makeResponse({ message: "Comment posted." }, config, 201);
  }

  // ── SETTINGS / MISC ───────────────────────────────────────────────
  if (method === "get" && /\/settings/.test(path)) {
    return makeResponse({
      siteName: "Roots Egypt",
      maintenance: false,
      allowSignup: true,
      allowRegistration: true,
      activityRetentionDays: 90,
      notifyAdmins: true,
      defaultLanguage: "en",
      maxTreesPerUser: 10,
      maxGalleryPerUser: 50,
    }, config);
  }

  if (method === "put" && /\/settings/.test(path)) {
    return makeResponse({ message: "Settings saved." }, config);
  }

  if (method === "put" && /\/profile/.test(path)) {
    return makeResponse({ message: "Profile updated." }, config);
  }

  if (method === "post" && /\/auth\/change-password/.test(path)) {
    return makeResponse({ message: "Password changed." }, config);
  }

  // ── AUDIO / PODCASTS ──────────────────────────────────────────────────
  if (method === "get" && /\/admin\/audio/.test(path)) {
    return makeResponse(MOCK_AUDIO, config);
  }

  if (method === "get" && /\/audio\/(\d+)$/.test(path)) {
    const match = path.match(/\/audio\/(\d+)$/);
    const id = parseInt(match![1], 10);
    const audio = MOCK_AUDIO.find((a) => a.id === id);
    if (!audio) throw makeError("Audio not found", 404);
    return makeResponse(audio, config);
  }

  if (method === "get" && /\/audio$/.test(path)) {
    return makeResponse(MOCK_AUDIO, config);
  }

  if (method === "post" && /\/audio$/.test(path)) {
    return makeResponse({ message: "Audio uploaded.", id: Date.now() }, config, 201);
  }

  if (method === "put" && /\/audio\/\d+$/.test(path)) {
    return makeResponse({ message: "Audio updated." }, config);
  }

  if (method === "delete" && /\/audio\/\d+$/.test(path)) {
    return makeResponse({ message: "Audio deleted." }, config);
  }

  if (method === "post" && /\/audio\/\d+\/play/.test(path)) {
    return makeResponse({ message: "Play count incremented." }, config);
  }

  if (method === "post" && /\/audio\/\d+\/like/.test(path)) {
    return makeResponse({ liked: true, count: Math.floor(Math.random() * 500) + 1 }, config);
  }

  // ── CONTACT SUBMISSIONS ───────────────────────────────────────────────
  if (method === "get" && /\/admin\/contact/.test(path)) {
    return makeResponse(MOCK_CONTACT_SUBMISSIONS, config);
  }

  if (method === "get" && /\/contact\/(\d+)$/.test(path)) {
    const match = path.match(/\/contact\/(\d+)$/);
    const id = parseInt(match![1], 10);
    const submission = MOCK_CONTACT_SUBMISSIONS.find((c) => c.id === id);
    if (!submission) throw makeError("Contact submission not found", 404);
    return makeResponse(submission, config);
  }

  if (method === "post" && /\/contact$/.test(path)) {
    let body: any = {};
    try {
      body = typeof config.data === "string" ? JSON.parse(config.data) : config.data || {};
    } catch { /* */ }
    return makeResponse({ 
      message: "Thank you for contacting us. We will respond within 24-48 hours.",
      id: Date.now(),
      ...body,
      status: "pending",
      createdAt: new Date().toISOString()
    }, config, 201);
  }

  if (method === "put" && /\/admin\/contact\/\d+/.test(path)) {
    return makeResponse({ message: "Contact submission updated." }, config);
  }

  if (method === "delete" && /\/admin\/contact\/\d+/.test(path)) {
    return makeResponse({ message: "Contact submission deleted." }, config);
  }

  // ── RESEARCH RESOURCES ────────────────────────────────────────────────
  if (method === "get" && /\/admin\/resources/.test(path)) {
    return makeResponse(MOCK_RESEARCH_RESOURCES, config);
  }

  if (method === "get" && /\/resources\/(\d+)$/.test(path)) {
    const match = path.match(/\/resources\/(\d+)$/);
    const id = parseInt(match![1], 10);
    const resource = MOCK_RESEARCH_RESOURCES.find((r) => r.id === id);
    if (!resource) throw makeError("Resource not found", 404);
    return makeResponse(resource, config);
  }

  if (method === "get" && /\/resources$/.test(path)) {
    const q = String(new URL(`http://x${url}`).searchParams.get("category") || "").toLowerCase().trim();
    const filtered = q ? MOCK_RESEARCH_RESOURCES.filter(r => r.category.toLowerCase().includes(q)) : MOCK_RESEARCH_RESOURCES;
    return makeResponse(filtered, config);
  }

  if (method === "post" && /\/admin\/resources$/.test(path)) {
    return makeResponse({ message: "Resource added.", id: Date.now() }, config, 201);
  }

  if (method === "put" && /\/admin\/resources\/\d+$/.test(path)) {
    return makeResponse({ message: "Resource updated." }, config);
  }

  if (method === "delete" && /\/admin\/resources\/\d+$/.test(path)) {
    return makeResponse({ message: "Resource deleted." }, config);
  }

  // ── HISTORICAL PERIODS ────────────────────────────────────────────────
  if (method === "get" && /\/admin\/periods/.test(path)) {
    return makeResponse(MOCK_PERIODS, config);
  }

  if (method === "get" && /\/periods\/(\d+)$/.test(path)) {
    const match = path.match(/\/periods\/(\d+)$/);
    const id = parseInt(match![1], 10);
    const period = MOCK_PERIODS.find((p) => p.id === id);
    if (!period) throw makeError("Period not found", 404);
    return makeResponse(period, config);
  }

  if (method === "get" && /\/periods$/.test(path)) {
    return makeResponse(MOCK_PERIODS, config);
  }

  if (method === "post" && /\/admin\/periods$/.test(path)) {
    return makeResponse({ message: "Period added.", id: Date.now() }, config, 201);
  }

  if (method === "put" && /\/admin\/periods\/\d+$/.test(path)) {
    return makeResponse({ message: "Period updated." }, config);
  }

  if (method === "delete" && /\/admin\/periods\/\d+$/.test(path)) {
    return makeResponse({ message: "Period deleted." }, config);
  }

  // ── CATCH-ALL ─────────────────────────────────────────────────────────
  // For any unknown endpoint, return empty success
  console.warn(`[MockAPI] Unhandled ${method.toUpperCase()} ${path} — returning empty 200`);
  return makeResponse({}, config);
}
