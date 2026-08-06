import { spawn } from "node:child_process";
import { join } from "node:path";

const env = {
  ...process.env,
  NEXT_DIST_DIR: process.env.NEXT_DIST_DIR || ".next-dev",
};

const nextBin = join(process.cwd(), "node_modules", "next", "dist", "bin", "next");

const child = spawn(process.execPath, [nextBin, "dev", ...process.argv.slice(2)], {
  env,
  stdio: "inherit",
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
