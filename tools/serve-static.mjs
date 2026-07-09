import { createServer } from "node:http";
import { createReadStream, promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const serveDir = path.resolve(rootDir, process.argv[2] || "dist");
const port = Number(process.argv[3] || process.env.PORT || 4173);

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".md", "text/markdown; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".gif", "image/gif"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
  [".ttf", "font/ttf"],
]);

function resolveRequestPath(requestUrl) {
  const url = new URL(requestUrl, `http://localhost:${port}`);
  const decodedPath = decodeURIComponent(url.pathname);
  const requested = path.resolve(serveDir, `.${decodedPath}`);
  if (!requested.startsWith(serveDir)) return null;
  return requested;
}

async function findFile(filePath) {
  const stat = await fs.stat(filePath).catch(() => null);
  if (!stat) return null;
  if (stat.isDirectory()) {
    const indexPath = path.join(filePath, "index.html");
    const indexStat = await fs.stat(indexPath).catch(() => null);
    return indexStat?.isFile() ? indexPath : null;
  }
  return stat.isFile() ? filePath : null;
}

const server = createServer(async (request, response) => {
  const requestedPath = resolveRequestPath(request.url || "/");
  const filePath = requestedPath ? await findFile(requestedPath) : null;

  if (!filePath) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const type = contentTypes.get(path.extname(filePath).toLowerCase()) || "application/octet-stream";
  response.writeHead(200, {
    "content-type": type,
    "cache-control": "no-store",
  });
  createReadStream(filePath).pipe(response);
});

server.listen(port, () => {
  console.log(`Serving ${serveDir} at http://localhost:${port}/`);
});
