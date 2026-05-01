"use strict";

const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const BOOTSTRAP_KEY = "__ROOTS_ENV_BOOTSTRAP__";
const APP_ROOT = __dirname;

function hasMeaningfulValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function normalizeCandidate(candidate, cwd) {
  if (typeof candidate === "string") {
    const fullPath = path.isAbsolute(candidate)
      ? candidate
      : path.resolve(cwd, candidate);
    return {
      label: candidate,
      fullPath,
    };
  }

  return {
    label: candidate.label || candidate.fullPath || ".env",
    fullPath: path.isAbsolute(candidate.fullPath)
      ? candidate.fullPath
      : path.resolve(cwd, candidate.fullPath || ".env"),
  };
}

function resolveCandidateFiles(cwd, env) {
  const isProduction = String(env.NODE_ENV || "").toLowerCase() === "production";
  const candidates = isProduction
    ? [
        // Primary: .env.production in cwd and app root
        {
          label: ".env.production",
          fullPath: path.resolve(cwd, ".env.production"),
        },
        {
          label: "app-root:.env.production",
          fullPath: path.resolve(APP_ROOT, ".env.production"),
        },
        // Fallback: .env (some Docker/EasyPanel setups use .env even in production)
        {
          label: ".env",
          fullPath: path.resolve(cwd, ".env"),
        },
        {
          label: "app-root:.env",
          fullPath: path.resolve(APP_ROOT, ".env"),
        },
      ]
    : [
        { label: ".env", fullPath: path.resolve(cwd, ".env") },
        { label: "app-root:.env", fullPath: path.resolve(APP_ROOT, ".env") },
      ];

  const seen = new Set();
  return candidates.filter((candidate) => {
    if (seen.has(candidate.fullPath)) {
      return false;
    }
    seen.add(candidate.fullPath);
    return true;
  });
}

function bootstrapEnv(options = {}) {
  const cwd = options.cwd || process.cwd();
  const env = options.env || process.env;
  const sourceByKey = {};

  Object.keys(env).forEach((key) => {
    if (hasMeaningfulValue(env[key])) {
      sourceByKey[key] = "host-env";
    }
  });

  const candidateSpecs = (options.files || resolveCandidateFiles(cwd, env)).map(
    (candidate) => normalizeCandidate(candidate, cwd),
  );
  const loadedFiles = [];
  const loadedPaths = [];

  for (const candidate of candidateSpecs) {
    const { label, fullPath } = candidate;
    const exists = fs.existsSync(fullPath);

    if (!exists) {
      continue;
    }

    // Skip empty placeholder files (e.g. Docker touch .env.production)
    const stat = fs.statSync(fullPath);
    if (stat.size === 0) {
      continue;
    }

    const parsed = dotenv.parse(fs.readFileSync(fullPath));
    loadedFiles.push(label);
    loadedPaths.push(fullPath);

    for (const [key, value] of Object.entries(parsed)) {
      if (!hasMeaningfulValue(env[key])) {
        env[key] = value;
        sourceByKey[key] = label;
      }
    }
  }

  const metadata = {
    cwd,
    candidateFiles: candidateSpecs.map((candidate) => candidate.label),
    loadedFiles,
    loadedPaths,
    sourceByKey,
  };

  global[BOOTSTRAP_KEY] = metadata;
  return metadata;
}

function getEnvBootstrapMeta() {
  return global[BOOTSTRAP_KEY] || {
    cwd: process.cwd(),
    candidateFiles: [],
    loadedFiles: [],
    loadedPaths: [],
    sourceByKey: {},
  };
}

function getEnvSource(key) {
  const meta = getEnvBootstrapMeta();
  return meta.sourceByKey[key];
}

module.exports = {
  bootstrapEnv,
  getEnvBootstrapMeta,
  getEnvSource,
};
