import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);
const publicRoot = new URL("../public/", import.meta.url);
const distRoot = new URL("../dist/", import.meta.url);
const routes = [
  "lp-formulation-sensitivity",
  "network-integer-decisions",
  "simulation-operating-risk",
  "forecast-to-decision",
];

test("build emits the four exact stable route directories", async () => {
  for (const route of routes) {
    const relative = `bus-3150/${route}/index.html`;
    await access(new URL(relative, distRoot));
    const html = await readFile(new URL(relative, distRoot), "utf8");
    assert.match(html, new RegExp(`rel="canonical" href="https://tools\\.benhartlage\\.com/bus-3150/${route}/"`));
    assert.match(html, /<meta name="viewport"/);
    assert.match(html, /class="skip-link"/);
    assert.match(html, /id="lab-root"/);
    assert.match(html, /<noscript>/);
    assert.match(html, /\.\.\/shared\/styles\.css/);
    assert.match(html, /\.\.\/shared\/app\.mjs/);
    assert.doesNotMatch(html, /<script(?![^>]*\bsrc=)[^>]*>/i);
  }

  const manifest = JSON.parse(await readFile(new URL("bus-3150/suite-manifest.json", distRoot), "utf8"));
  assert.equal(manifest.routes.length, 4);
  assert.equal(manifest.dataPolicy, "anonymous-browser-local-no-retention");
});

test("shared app exposes accessible tables, diagnostics, and individual handoff", async () => {
  const [app, styles] = await Promise.all([
    readFile(new URL("bus-3150/shared/app.mjs", publicRoot), "utf8"),
    readFile(new URL("bus-3150/shared/styles.css", publicRoot), "utf8"),
  ]);

  assert.match(app, /aria-live="polite"/);
  assert.match(app, /<caption>/);
  assert.match(app, /scope="col"/);
  assert.match(app, /scope="row"/);
  assert.match(app, /Five-minute individual handoff/);
  assert.match(app, /Commit and reveal evidence/);
  assert.match(app, /Try an alternate run/);
  assert.match(app, /No account\. No retained responses\./);

  assert.match(styles, /:focus-visible/);
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(styles, /forced-colors/);
  assert.match(styles, /overflow-x:\s*auto/);
  assert.match(styles, /@media \(max-width:/);
});

test("runtime is anonymous, browser-local, and free of network or retained-state APIs", async () => {
  const runtimeFiles = await Promise.all([
    readFile(new URL("bus-3150/shared/app.mjs", publicRoot), "utf8"),
    readFile(new URL("bus-3150/shared/lab-core.mjs", publicRoot), "utf8"),
  ]);
  const runtime = runtimeFiles.join("\n");
  const forbidden = [
    /\bfetch\s*\(/,
    /\bXMLHttpRequest\b/,
    /\bWebSocket\b/,
    /\blocalStorage\b/,
    /\bsessionStorage\b/,
    /\bdocument\.cookie\b/,
    /\bindexedDB\b/,
    /\bnavigator\.sendBeacon\b/,
  ];
  for (const pattern of forbidden) assert.doesNotMatch(runtime, pattern);
  assert.doesNotMatch(runtime, /<svg|<canvas/i);
});

test("package contains no Sites, Next, database, or hosting metadata", async () => {
  const packageJson = JSON.parse(await readFile(new URL("package.json", projectRoot), "utf8"));
  assert.deepEqual(packageJson.dependencies ?? {}, {});
  assert.deepEqual(packageJson.devDependencies ?? {}, {});
  assert.equal(packageJson.scripts.build, "node scripts/build.mjs");
  assert.equal(packageJson.scripts.preview, "node scripts/static-server.mjs");

  await assert.rejects(access(new URL(".openai/hosting.json", projectRoot)));
  await assert.rejects(access(new URL("next.config.ts", projectRoot)));
  await assert.rejects(access(new URL("vite.config.ts", projectRoot)));
  await assert.rejects(access(new URL("drizzle.config.ts", projectRoot)));
});
