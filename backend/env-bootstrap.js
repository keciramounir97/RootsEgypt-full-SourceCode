"use strict";

const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const BOOTSTRAP_KEY = "__ROOTS_ENV_BOOTSTRAP__";

function hasMeaningfulValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function resolveCandidateFiles(cwd, env) {
  return [".env"];
}

function bootstrapEnv(options = {}) {
  if (global[BOOTSTRAP_KEY]) {
    return global[BOOTSTRAP_KEY];
  }

  const cwd = options.cwd || process.cwd();
  const env = options.env || process.env;
  const sourceByKey = {};

  Object.keys(env).forEach((key) => {
    if (hasMeaningfulValue(env[key])) {
      sourceByKey[key] = "host-env";
    }
  });

  const candidateFiles = options.files || resolveCandidateFiles(cwd, env);
  const loadedFiles = [];

  for (const file of candidateFiles) {
    const fullPath = path.join(cwd, file);
    if (!fs.existsSync(fullPath)) {
      continue;
    }

    const parsed = dotenv.parse(fs.readFileSync(fullPath));
    loadedFiles.push(file);

    for (const [key, value] of Object.entries(parsed)) {
      if (!hasMeaningfulValue(env[key])) {
        env[key] = value;
        sourceByKey[key] = file;
      }
    }
  }

  const metadata = {
    cwd,
    candidateFiles,
    loadedFiles,
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
