/**
 * RootsEgypt — Production Entry Point (Docker / EasyPanel)
 */

try {
  require("dotenv").config({ path: ".env" });
  require("dotenv").config({ path: ".env.production", override: false });
  require("dotenv").config({ path: ".env.local", override: false });
} catch {
  // If dotenv fails, Nest/Node env may still be injected by the container.
}

console.log(
  "CONFIG bootstrap envFiles=.env,.env.production,.env.local secretsSource=host-env-vars-first buildContext=repo-root dockerfile=backend/Dockerfile",
);

// EasyPanel / Docker provides the PORT environment variable.
// Our NestJS app is configured to listen on process.env.PORT in main.ts.

// We import the compiled main file.
require("./dist/main.js");
