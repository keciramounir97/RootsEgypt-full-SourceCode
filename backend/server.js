/**
 * ROOTS EGYPT - PRODUCTION ENTRY POINT (EasyPanel / Docker)
 */

const { bootstrapEnv } = require("./env-bootstrap");

bootstrapEnv({ cwd: __dirname, env: process.env });

require("./dist/main.js");
