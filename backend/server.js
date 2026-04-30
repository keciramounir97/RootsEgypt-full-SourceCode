/**
 * RootsEgypt Production Entry Point (Docker / EasyPanel)
 */

const { bootstrapEnv, getEnvBootstrapMeta } = require("./env-bootstrap");

bootstrapEnv();
const envMeta = getEnvBootstrapMeta();

console.log(
  `CONFIG bootstrap envFiles=${envMeta.candidateFiles.join(",") || "none"} loadedFiles=${envMeta.loadedFiles.join(",") || "none"} loadedPaths=${envMeta.loadedPaths.join(",") || "none"} precedence=host-env>${String(process.env.NODE_ENV || "").toLowerCase() === "production" ? ".env.production" : ".env"} buildContext=backend dockerfile=backend/Dockerfile`,
);

require("./dist/main.js");
