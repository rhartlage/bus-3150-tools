import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);
const routes = [
  "lp-formulation-sensitivity",
  "network-integer-decisions",
  "simulation-operating-risk",
  "forecast-to-decision",
];

test("local preview serves the directory and all four nested routes", async () => {
  const port = 43000 + (process.pid % 1000);
  const child = spawn(process.execPath, ["scripts/static-server.mjs"], {
    cwd: projectRoot,
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let stderr = "";
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await Promise.race([
      new Promise((resolve, reject) => {
        child.stdout.on("data", (chunk) => {
          if (chunk.toString().includes("BUS-3150 local preview")) resolve();
        });
        child.once("exit", (code) => reject(new Error(`Preview exited early (${code}): ${stderr}`)));
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error(`Preview startup timed out: ${stderr}`)), 5000)),
    ]);

    const directory = await fetch(`http://127.0.0.1:${port}/bus-3150/`);
    assert.equal(directory.status, 200);
    assert.match(await directory.text(), /Four labs\. One predictable learning rhythm\./);

    for (const route of routes) {
      const response = await fetch(`http://127.0.0.1:${port}/bus-3150/${route}/`);
      assert.equal(response.status, 200, route);
      assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/);
      assert.match(await response.text(), /id="lab-root"/);
    }

    const sharedModule = await fetch(`http://127.0.0.1:${port}/bus-3150/shared/app.mjs`);
    assert.equal(sharedModule.status, 200);
    assert.match(sharedModule.headers.get("content-type") ?? "", /^text\/javascript\b/);
  } finally {
    child.kill();
  }
});
