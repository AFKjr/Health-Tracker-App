// Static checks that sw.js precaches everything the app needs to work offline.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./helpers/server.mjs";

const read = function(file) { return fs.readFileSync(path.join(ROOT, file), "utf8"); };
const sw = read("sw.js");
const listMatch = /const ASSETS_TO_CACHE = \[([\s\S]*?)\];/.exec(sw);
const assets = listMatch ? [...listMatch[1].matchAll(/'([^']+)'/g)].map(function(m) { return m[1]; }) : [];

describe("service worker precache list", function() {
    it("can be parsed from sw.js", function() {
        assert.ok(assets.length > 0);
    });

    it("includes every module in js/", function() {
        const modules = fs.readdirSync(path.join(ROOT, "js")).filter(function(f) { return f.endsWith(".js"); });
        const missing = modules.map(function(f) { return "js/" + f; }).filter(function(f) { return !assets.includes(f); });
        assert.deepEqual(missing, []);
    });

    it("includes every page, stylesheet, icon, and the manifest", function() {
        const files = fs.readdirSync(ROOT).filter(function(f) { return /\.(html|css|svg)$/.test(f) || f === "manifest.json"; });
        const missing = files.filter(function(f) { return !assets.includes(f); });
        assert.deepEqual(missing, []);
    });

    it("only lists local files that exist", function() {
        const missing = assets.filter(function(a) { return !a.startsWith("http") && !fs.existsSync(path.join(ROOT, a)); });
        assert.deepEqual(missing, []);
    });

    it("caches exactly the pinned CDN scripts that logs.html loads", function() {
        const pageScripts = [...read("logs.html").matchAll(/<script src="(https:[^"]+)"/g)].map(function(m) { return m[1]; });
        assert.deepEqual(assets.filter(function(a) { return a.startsWith("http"); }), pageScripts);
        for (const url of pageScripts) {
            assert.match(url, /@\d+\.\d+\.\d+$/, `${url} should be pinned to an exact version`);
        }
    });
});
