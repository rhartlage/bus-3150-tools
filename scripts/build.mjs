import { access, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(repoRoot, "public");
const distRoot = path.join(repoRoot, "dist");

if (path.dirname(distRoot) !== repoRoot || path.basename(distRoot) !== "dist") {
  throw new Error(`Refusing to clean unexpected build path: ${distRoot}`);
}

const routes = [
  "bus-3150/lp-formulation-sensitivity/index.html",
  "bus-3150/network-integer-decisions/index.html",
  "bus-3150/simulation-operating-risk/index.html",
  "bus-3150/forecast-to-decision/index.html",
];
const shared = [
  "bus-3150/shared/styles.css",
  "bus-3150/shared/app.mjs",
  "bus-3150/shared/lab-core.mjs",
];

await rm(distRoot, { recursive: true, force: true });
await mkdir(distRoot, { recursive: true });
await cp(sourceRoot, distRoot, { recursive: true });

for (const relativePath of [...routes, ...shared]) {
  await access(path.join(distRoot, relativePath));
}

for (const route of routes) {
  const html = await readFile(path.join(distRoot, route), "utf8");
  const expectedRoute = `https://tools.benhartlage.com/${route.replace(/index\.html$/, "")}`;
  if (!html.includes(`rel="canonical" href="${expectedRoute}"`)) {
    throw new Error(`${route} is missing canonical route ${expectedRoute}`);
  }
}

const manifest = {
  schemaVersion: 1,
  course: "BUS-3150",
  routes: routes.map((route) => `/${route.replace(/index\.html$/, "")}`),
  shared: shared.map((file) => `/${file}`),
  dataPolicy: "anonymous-browser-local-no-retention",
};
await writeFile(
  path.join(distRoot, "bus-3150", "suite-manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

process.stdout.write(`Built ${routes.length} BUS-3150 routes in ${distRoot}\n`);
