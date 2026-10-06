// Minimal static file server for the repo root, so tests don't need Python.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = fileURLToPath(new URL("../../", import.meta.url));

const TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json",
    ".svg": "image/svg+xml",
};

// Starts on a free port; resolves to { server, base } where base ends with "/"
export function startServer() {
    const server = http.createServer(function(req, res) {
        const urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
        const file = path.join(ROOT, path.normalize(urlPath));
        if (!file.startsWith(ROOT)) {
            res.writeHead(403).end();
            return;
        }
        fs.readFile(file, function(err, data) {
            if (err) {
                res.writeHead(404).end();
                return;
            }
            res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
            res.end(data);
        });
    });
    return new Promise(function(resolve) {
        server.listen(0, "127.0.0.1", function() {
            resolve({ server, base: `http://127.0.0.1:${server.address().port}/` });
        });
    });
}
