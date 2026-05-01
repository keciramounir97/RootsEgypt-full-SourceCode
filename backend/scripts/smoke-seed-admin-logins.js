"use strict";

const BASE_URL = (process.env.SMOKE_BASE_URL || "http://127.0.0.1:5000")
  .replace(/\/+$/, "");

const accounts = [
  ["karimadmin@rootsegypt.org", "admin2025$"],
  ["kameladmin@rootsegypt.org", "vivreplusfort18041972SS"],
  ["devteam@rootsegypt.org", "admin2025$"],
];

async function parseJson(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
}

function unwrap(payload) {
  return payload && payload.data ? payload.data : payload;
}

async function smokeAccount([email, password]) {
  const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const loginPayload = await parseJson(loginResponse);
  const loginData = unwrap(loginPayload);
  const token = loginData?.token;

  if (!loginResponse.ok || !token) {
    throw new Error(
      `${email} login failed status=${loginResponse.status} body=${JSON.stringify(loginPayload).slice(0, 300)}`,
    );
  }

  const meResponse = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const mePayload = await parseJson(meResponse);
  const meData = unwrap(mePayload);

  if (!meResponse.ok || String(meData?.email || "").toLowerCase() !== email) {
    throw new Error(
      `${email} /auth/me failed status=${meResponse.status} body=${JSON.stringify(mePayload).slice(0, 300)}`,
    );
  }

  return {
    email,
    status: "ok",
    userId: meData.id,
    roleId: meData.roleId ?? meData.role_id,
    degraded: Boolean(loginData.degraded || meData.seedAdmin),
  };
}

(async () => {
  const results = [];
  for (const account of accounts) {
    results.push(await smokeAccount(account));
  }
  console.log(JSON.stringify({ baseUrl: BASE_URL, results }, null, 2));
})().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
