import { createServer } from "node:http";
import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = path.join(repoRoot, "dist");
const publicRoot = path.join(repoRoot, "public");
const port = Number(process.env.PORT || 4173);

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

const root = await exists(path.join(distRoot, "index.html")) ? distRoot : publicRoot;
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
};

createServer(async (request, response) => {
  const requestUrl = new URL(request.url || "/", "http://localhost");
  const decoded = decodeURIComponent(requestUrl.pathname);
  const requestedPath = decoded.endsWith("/") ? `${decoded}index.html` : decoded;
  const relativePath = requestedPath.replace(/^[/\\]+/, "");
  const candidate = path.resolve(root, relativePath);

  if (candidate !== root && !candidate.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403, { "content-type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return;
  }

  try {
    const info = await stat(candidate);
    const filePath = info.isDirectory() ? path.join(candidate, "index.html") : candidate;
    const body = await readFile(filePath);
    response.writeHead(200, {
      "content-type": contentTypes[path.extname(filePath)] || "application/octet-stream",
      "cache-control": "no-store",
    });
    response.end(body);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}).listen(port, "127.0.0.1", () => {
  process.stdout.write(`BUS-3150 local preview: http://127.0.0.1:${port}/bus-3150/\n`);
});
