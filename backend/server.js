/**
 * RootsEgypt — Production Entry Point (Docker / EasyPanel)
 */

// EasyPanel / Docker provides the PORT environment variable.
// Our NestJS app is configured to listen on process.env.PORT in main.ts.

// We import the compiled main file.
require("./dist/main.js");
