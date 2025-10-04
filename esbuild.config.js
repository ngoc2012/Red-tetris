import { build } from "esbuild";

build({
  entryPoints: ["src/server/main.js"],
  bundle: true,
  platform: "node",
  target: "node20",
  outfile: "server/main.js",
  format: "esm",
  sourcemap: true,
  logLevel: "info",
}).catch(() => process.exit(1));
