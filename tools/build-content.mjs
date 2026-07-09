import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const contentDir = path.join(rootDir, "content");
const indexDir = path.join(contentDir, "indexes");
const distDir = path.join(rootDir, "dist");

const copyRootExtensions = new Set([
  ".html",
  ".css",
  ".js",
  ".json",
  ".txt",
  ".ico",
  ".png",
  ".svg",
  ".webmanifest",
]);

function toPosixPath(filePath) {
  return filePath.split(path.sep).join("/");
}

function relativeContentPath(filePath) {
  return toPosixPath(path.relative(rootDir, filePath));
}

function stableId(type, date, contentPath) {
  const hash = createHash("sha1").update(contentPath).digest("hex").slice(0, 8);
  return `${type}_${date.replaceAll("-", "")}_${hash}`;
}

function normalizeDate(value, fallback = new Date()) {
  if (!value) return fallback.toISOString().slice(0, 10);
  const text = String(value).trim();
  const direct = text.match(/^(\d{4}-\d{2}-\d{2})/);
  if (direct) return direct[1];
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return fallback.toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function parseScalar(rawValue) {
  const value = String(rawValue ?? "").trim();
  if (value === "") return "";
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  if (value.startsWith("[") && value.endsWith("]")) {
    const inner = value.slice(1, -1).trim();
    if (!inner) return [];
    return inner
      .split(",")
      .map((item) => parseScalar(item.trim()))
      .filter((item) => item !== "");
  }
  const quoted = value.match(/^(['"])([\s\S]*)\1$/);
  if (quoted) return quoted[2];
  return value;
}

function parseFrontMatter(markdown) {
  const source = String(markdown || "").replace(/^\uFEFF/, "");
  if (!source.startsWith("---")) return { data: {}, body: source };

  const end = source.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*(?:[\r\n]+|$)/);
  if (!end) return { data: {}, body: source };

  const yaml = end[1];
  const body = source.slice(end[0].length);
  const data = {};
  const lines = yaml.split(/\r?\n/);
  let pendingArrayKey = null;

  for (const line of lines) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;

    const arrayItem = line.match(/^\s*-\s+(.+)$/);
    if (arrayItem && pendingArrayKey) {
      data[pendingArrayKey].push(parseScalar(arrayItem[1]));
      continue;
    }

    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (rawValue.trim() === "") {
      data[key] = [];
      pendingArrayKey = key;
      continue;
    }

    data[key] = parseScalar(rawValue);
    pendingArrayKey = null;
  }

  return { data, body };
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags.map((tag) => String(tag).trim()).filter(Boolean);
  if (typeof tags === "string") {
    return tags.split(/[,\s，、]+/).map((tag) => tag.trim()).filter(Boolean);
  }
  return [];
}

function countWords(markdownBody) {
  const text = String(markdownBody || "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\[[^\]]+]\([^)]+\)/g, "")
    .replace(/[#>*_\-~=[\]():|{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const cjk = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const latin = (text.match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g) || []).length;
  return cjk + latin;
}

function excerptFromBody(markdownBody) {
  const paragraph = String(markdownBody || "")
    .split(/\r?\n\r?\n/)
    .map((block) => block.trim())
    .find((block) => block && !block.startsWith("#") && !block.startsWith("```") && !block.startsWith(":::"));
  if (!paragraph) return "";
  return paragraph
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[*_`>#~]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

async function listMarkdownFiles(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return listMarkdownFiles(fullPath);
      if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) return [fullPath];
      return [];
    }));
    return files.flat();
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function buildEntries(type) {
  const baseDir = path.join(contentDir, type === "post" ? "posts" : "notes");
  const files = await listMarkdownFiles(baseDir);

  const entries = await Promise.all(files.map(async (filePath) => {
    const raw = await fs.readFile(filePath, "utf8");
    const stat = await fs.stat(filePath);
    const { data, body } = parseFrontMatter(raw);
    const contentPath = relativeContentPath(filePath);
    const title = String(data.title || path.basename(filePath, ".md")).trim();
    const category = String(data.category || path.basename(path.dirname(filePath)) || "未分类").trim();
    const date = normalizeDate(data.date || data.createdAt || stat.birthtime, stat.birthtime);
    const updatedAt = data.updatedAt ? String(data.updatedAt) : stat.mtime.toISOString();
    const createdAt = data.createdAt ? String(data.createdAt) : stat.birthtime.toISOString();
    const wordCount = countWords(body);
    const entryType = String(data.type || type);

    return {
      ...data,
      id: data.id || stableId(entryType, date, contentPath),
      type: entryType,
      title,
      slug: data.slug || title,
      date,
      category,
      tags: normalizeTags(data.tags),
      status: data.status || "draft",
      visible: data.visible !== false,
      createdAt,
      updatedAt,
      wordCount,
      importedPath: data.importedPath || contentPath,
      ...(data.summary ? { summary: String(data.summary) } : {}),
      ...(!data.summary && type === "note" ? { summary: excerptFromBody(body) } : {}),
      contentPath,
    };
  }));

  return entries.sort((a, b) => {
    const byDate = String(b.date).localeCompare(String(a.date));
    if (byDate) return byDate;
    return String(b.updatedAt).localeCompare(String(a.updatedAt));
  });
}

function groupByCategory(entries) {
  const groups = new Map();
  for (const entry of entries) {
    const category = entry.category || "未分类";
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(entry);
  }
  return groups;
}

function createManifest(entries, type) {
  return Array.from(groupByCategory(entries), ([category, items]) => ({
    category,
    count: items.length,
    wordCount: items.reduce((sum, item) => sum + (Number(item.wordCount) || 0), 0),
    indexPath: `content/indexes/${type}/${category}.json`,
  }));
}

function createTimeline(posts, notes) {
  return [...posts, ...notes]
    .filter((entry) => entry.visible !== false)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .map((entry) => ({
      id: entry.id,
      type: entry.type,
      title: entry.title,
      date: entry.date,
      category: entry.type === "note" ? (entry.noteType || entry.category) : entry.category,
      href: entry.contentPath,
    }));
}

function createSearch(posts, notes) {
  return [...posts, ...notes]
    .filter((entry) => entry.visible !== false)
    .map((entry) => ({
      id: entry.id,
      type: entry.type,
      title: entry.title,
      date: entry.date,
      summary: entry.summary || "",
      tags: entry.tags || [],
      path: entry.contentPath,
    }));
}

function createSiteSummary(posts, notes, timeline, postManifest, noteManifest) {
  const allEntries = [...posts, ...notes];
  return {
    updatedAt: new Date().toISOString(),
    counts: {
      posts: posts.length,
      notes: notes.length,
      media: 0,
      albums: 0,
    },
    wordCount: allEntries.reduce((sum, item) => sum + (Number(item.wordCount) || 0), 0),
    latestPosts: posts.slice(0, 6),
    latestNotes: notes.slice(0, 6),
    timelinePreview: timeline.slice(0, 12),
    categories: {
      posts: postManifest,
      notes: noteManifest,
    },
  };
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function writeCategoryIndexes(entries, type) {
  const dir = path.join(indexDir, type);
  const manifest = createManifest(entries, type);
  await fs.mkdir(dir, { recursive: true });
  await Promise.all(Array.from(groupByCategory(entries), ([category, items]) => (
    writeJson(path.join(dir, `${category}.json`), items)
  )));
  await writeJson(path.join(dir, "_manifest.json"), manifest);
  return manifest;
}

async function copyDirectory(source, target) {
  await fs.mkdir(target, { recursive: true });
  const entries = await fs.readdir(source, { withFileTypes: true });
  await Promise.all(entries.map(async (entry) => {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath);
      return;
    }
    if (entry.isFile()) await fs.copyFile(sourcePath, targetPath);
  }));
}

async function buildDist() {
  await fs.rm(distDir, { recursive: true, force: true });
  await fs.mkdir(distDir, { recursive: true });

  const rootEntries = await fs.readdir(rootDir, { withFileTypes: true });
  await Promise.all(rootEntries.map(async (entry) => {
    const sourcePath = path.join(rootDir, entry.name);
    const targetPath = path.join(distDir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "assets" || entry.name === "content") {
        await copyDirectory(sourcePath, targetPath);
      }
      return;
    }
    if (entry.isFile() && copyRootExtensions.has(path.extname(entry.name).toLowerCase())) {
      await fs.copyFile(sourcePath, targetPath);
    }
  }));
}

async function main() {
  const [posts, notes] = await Promise.all([
    buildEntries("post"),
    buildEntries("note"),
  ]);

  await fs.rm(indexDir, { recursive: true, force: true });
  await fs.mkdir(indexDir, { recursive: true });

  const [postManifest, noteManifest] = await Promise.all([
    writeCategoryIndexes(posts, "posts"),
    writeCategoryIndexes(notes, "notes"),
    writeJson(path.join(indexDir, "posts.json"), posts),
    writeJson(path.join(indexDir, "notes.json"), notes),
    writeJson(path.join(indexDir, "media.json"), []),
    writeJson(path.join(indexDir, "albums.json"), []),
  ]);

  const timeline = createTimeline(posts, notes);
  const search = createSearch(posts, notes);
  const siteSummary = createSiteSummary(posts, notes, timeline, postManifest, noteManifest);

  await Promise.all([
    writeJson(path.join(indexDir, "timeline.json"), timeline),
    writeJson(path.join(indexDir, "search.json"), search),
    writeJson(path.join(indexDir, "site-summary.json"), siteSummary),
    writeJson(path.join(indexDir, "site.json"), siteSummary),
  ]);

  await buildDist();

  console.log(`Built ${posts.length} posts and ${notes.length} notes into ${relativeContentPath(distDir)}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
