// End-to-end tests: both pages driven in the locally installed Chrome.
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { startServer, ROOT } from "./helpers/server.mjs";
import { launchBrowser, openPage, storedEntries, seed, toastText, waitForToast, entry } from "./helpers/browser.mjs";

let server, BASE, browser, tmpDir;

before(async function() {
    ({ server, base: BASE } = await startServer());
    browser = await launchBrowser();
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "health-tracker-tests-"));
});

after(async function() {
    await browser?.close();
    server?.close();
    if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true });
});

// Runs fn with a fresh page, then checks no uncaught errors happened and closes it
async function withPage(options, fn) {
    const { context, page, errors } = await openPage(browser, options);
    try {
        await fn(page);
        assert.deepEqual(errors, [], "uncaught page errors");
    } finally {
        await context.close();
    }
}

const chartsDrawn = function(page) {
    return page.evaluate(function() {
        return ["weight-chart", "bp-chart", "bmi-chart"].map(function(id) { return !!Chart.getChart(id); });
    });
};

describe("entry page", function() {
    it("shows validation errors as toasts", async function() {
        await withPage({}, async function(page) {
            await page.goto(BASE + "index.html");
            await page.click('button[type="submit"]');
            assert.equal(await toastText(page), "Please enter your height!");
            await page.click("#add-exercise-button");
            assert.equal(await toastText(page), "Please select an exercise from the list.");
        });
    });

    it("adds, toggles, and removes queued exercises", async function() {
        await withPage({}, async function(page) {
            await page.goto(BASE + "index.html");
            await page.selectOption("#exercise-name", "push-ups");
            await page.fill("#exercise-reps", "20");
            await page.click("#add-exercise-button");

            await page.selectOption("#exercise-name", "running");
            assert.equal(await page.locator("#exercise-time").isVisible(), true);
            assert.equal(await page.locator("#exercise-reps").isVisible(), false);
            await page.fill("#exercise-time", "30");
            await page.click("#add-exercise-button");

            await page.selectOption("#exercise-name", "other");
            assert.equal(await page.locator("#custom-exercise").isVisible(), true);
            await page.fill("#custom-exercise", "Jump rope");
            await page.fill("#exercise-reps", "15");
            await page.click("#add-exercise-button");
            assert.equal(await page.locator("#exercise-queue li").count(), 3);

            await page.locator("#exercise-queue .remove-queue-btn").first().click();
            assert.deepEqual(await page.locator("#exercise-queue li").allTextContents(), ["running: 30 min ✕", "Jump rope: 15 reps ✕"]);
        });
    });

    it("saves an entry, shows results, clears the queue, and pre-fills next time", async function() {
        await withPage({}, async function(page) {
            await page.goto(BASE + "index.html");
            await page.fill("#feet", "5");
            await page.fill("#inches", "10");
            await page.fill("#weight", "180");
            await page.fill("#blood-pressure", "120/80");
            await page.selectOption("#exercise-name", "squats");
            await page.fill("#exercise-reps", "10");
            await page.click("#add-exercise-button");
            await page.click('button[type="submit"]');

            assert.equal(await toastText(page), "Data saved successfully!");
            assert.equal(await page.locator("#bmi-result").textContent(), "Your BMI is 25.8");
            assert.equal(await page.locator("#exercise-queue .queue-empty").count(), 1);
            const [saved] = await storedEntries(page);
            assert.deepEqual(saved.exercises, [{ name: "squats", reps: "10" }]);

            await page.reload();
            assert.equal(await page.inputValue("#feet"), "5");
            assert.equal(await page.inputValue("#weight"), "180");
            assert.equal(await page.inputValue("#blood-pressure"), "120/80");
        });
    });

    it("saves a corrected height and uses it for BMI", async function() {
        await withPage({}, async function(page) {
            await page.goto(BASE + "index.html");
            await page.fill("#feet", "5");
            await page.fill("#inches", "10");
            await page.fill("#weight", "180");
            await page.fill("#blood-pressure", "120/80");
            await page.click('button[type="submit"]');
            await page.fill("#feet", "6");
            await page.fill("#inches", "0");
            await page.click('button[type="submit"]');

            assert.equal(await page.locator("#bmi-result").textContent(), "Your BMI is 24.4");
            await page.reload();
            assert.equal(await page.inputValue("#feet"), "6");
            assert.equal(await page.inputValue("#inches"), "0");
        });
    });

    it("erases all data after confirmation", async function() {
        await withPage({}, async function(page) {
            await page.goto(BASE + "index.html");
            await seed(page, [entry("2026-10-01", "180")], { feet: "5", inches: "10" });
            await page.click("#erase-data-button");
            await page.waitForLoadState("load");
            assert.deepEqual(await storedEntries(page), []);
            assert.equal(await page.evaluate(function() { return localStorage.getItem("userHeight"); }), null);
        });
    });
});

describe("logs page", function() {
    it("lists entries newest-first by date and charts them oldest-first", async function() {
        await withPage({}, async function(page) {
            await page.goto(BASE + "index.html");
            // Stored in entry order: Sep 1 was back-dated and added second
            await seed(page, [entry("2026-10-03", "170"), entry("2026-09-01", "190"), entry("2026-10-01", "180")]);
            await page.goto(BASE + "logs.html");

            assert.deepEqual(await page.locator(".log-entry h3").allTextContents(), ["Date: 2026-10-03", "Date: 2026-10-01", "Date: 2026-09-01"]);
            const chart = await page.evaluate(function() {
                const c = Chart.getChart("weight-chart");
                return { labels: c.data.labels, data: c.data.datasets[0].data };
            });
            assert.deepEqual(chart, { labels: ["2026-09-01", "2026-10-01", "2026-10-03"], data: [190, 180, 170] });
            assert.equal(await page.evaluate(function() {
                return Object.keys(Chart.getChart("bp-chart").options.plugins.annotation.annotations).length;
            }), 5);
        });
    });

    it("edits and deletes the right stored entry after sorting", async function() {
        await withPage({}, async function(page) {
            await page.goto(BASE + "index.html");
            await seed(page, [entry("2026-10-03", "170"), entry("2026-09-01", "190"), entry("2026-10-01", "180")], { feet: "5", inches: "10" });
            await page.goto(BASE + "logs.html");

            // Second card is Oct 1, stored at index 2
            await page.locator(".log-entry").nth(1).locator('button[data-action="edit"]').click();
            await page.fill("#edit-weight-2", "500");
            await page.click('#entry-2 button[data-action="save"]');
            assert.equal(await toastText(page), "Please enter a valid weight between 50 and 300 lbs.");
            await page.fill("#edit-weight-2", "181");
            await page.click('#entry-2 button[data-action="save"]');
            assert.equal(await toastText(page), "Entry updated!");
            let stored = await storedEntries(page);
            assert.deepEqual(stored.map(function(e) { return e.weight; }), ["170", "190", "181"]);
            assert.equal(stored[2].bmi, "26.0");

            // Last card is Sep 1, stored at index 1
            await page.locator(".log-entry").nth(2).locator('button[data-action="delete"]').click();
            assert.equal(await toastText(page), "Entry deleted.");
            stored = await storedEntries(page);
            assert.deepEqual(stored.map(function(e) { return e.date; }), ["2026-10-03", "2026-10-01"]);
        });
    });

    it("discards removed exercises when an edit is cancelled", async function() {
        await withPage({}, async function(page) {
            await page.goto(BASE + "index.html");
            const exercises = [{ name: "squats", reps: "10" }, { name: "running", time: "30" }];
            await seed(page, [entry("2026-10-01", "180", { exercises })]);
            await page.goto(BASE + "logs.html");

            await page.click('#entry-0 button[data-action="edit"]');
            await page.locator('#entry-0 button[data-action="remove-exercise"]').first().click();
            assert.equal(await page.locator("#edit-exercises-list-0 li").count(), 1);
            await page.click('#entry-0 button[data-action="cancel"]');
            assert.deepEqual((await storedEntries(page))[0].exercises, exercises);
            assert.equal(await page.locator(".log-entry li").count(), 2);
        });
    });

    it("filters by the local date and clears charts when nothing matches", async function() {
        // 10pm on Oct 5 in Los Angeles is already Oct 6 in UTC
        await withPage({ timezoneId: "America/Los_Angeles" }, async function(page) {
            await page.clock.setFixedTime(new Date("2026-10-06T05:00:00Z"));
            await page.goto(BASE + "index.html");
            assert.equal(await page.inputValue("#date-entry"), "2026-10-05");

            await seed(page, [entry("2026-09-27", "180"), entry("2026-09-28", "180"), entry("2026-10-05", "180")]);
            await page.goto(BASE + "logs.html");
            await page.selectOption("#date-filter", "7");
            assert.deepEqual(await page.locator(".log-entry h3").allTextContents(), ["Date: 2026-10-05", "Date: 2026-09-28"]);

            await seed(page, [entry("2026-01-01", "180")]);
            await page.selectOption("#date-filter", "30");
            assert.deepEqual(await chartsDrawn(page), [false, false, false]);
            assert.equal(await page.locator("#logs-container").textContent(), "No logs found. Start tracking health on the home page!");

            await page.selectOption("#date-filter", "all");
            assert.deepEqual(await chartsDrawn(page), [true, true, true]);
        });
    });

    it("exports CSV and imports it back unchanged, re-importing the same file", async function() {
        await withPage({}, async function(page) {
            await page.goto(BASE + "index.html");
            const entries = [
                entry("2026-10-01", "180", { exercises: [{ name: 'Bob\'s "fun", run; fast', reps: "15" }, { name: "running", time: "30" }] }),
                entry("2026-10-02", "175"),
            ];
            await seed(page, entries);
            await page.goto(BASE + "logs.html");

            const [download] = await Promise.all([page.waitForEvent("download"), page.click("#export-csv-btn")]);
            assert.equal(download.suggestedFilename(), "health-tracker-export.csv");
            const csvPath = path.join(tmpDir, "export.csv");
            await download.saveAs(csvPath);

            await seed(page, []);
            await page.setInputFiles("#import-csv", csvPath);
            await waitForToast(page, "CSV imported successfully!");
            assert.deepEqual(await storedEntries(page), entries);
            assert.equal(await page.locator(".log-entry").count(), 2);

            await seed(page, []);
            await page.evaluate(function() { document.getElementById("toast").textContent = ""; });
            await page.setInputFiles("#import-csv", csvPath);
            await waitForToast(page, "CSV imported successfully!");
            assert.deepEqual(await storedEntries(page), entries);
        });
    });

    it("rejects a bad CSV without touching saved data", async function() {
        await withPage({}, async function(page) {
            await page.goto(BASE + "index.html");
            await seed(page, [entry("2026-10-01", "180")]);
            await page.goto(BASE + "logs.html");

            const badPath = path.join(tmpDir, "bad.csv");
            fs.writeFileSync(badPath, "Date,Weight,Systolic,Diastolic\n2026-10-02,180,999,80\n");
            await page.setInputFiles("#import-csv", badPath);
            await waitForToast(page, "Row 2: Please enter a valid blood pressure reading.");
            assert.deepEqual(await storedEntries(page), [entry("2026-10-01", "180")]);
        });
    });

    it("backs up and restores JSON including height", async function() {
        await withPage({}, async function(page) {
            await page.goto(BASE + "index.html");
            const entries = [entry("2026-10-01", "180", { exercises: [{ name: "squats", reps: "10" }] })];
            await seed(page, entries, { feet: "5", inches: "10" });
            await page.goto(BASE + "logs.html");

            const [download] = await Promise.all([page.waitForEvent("download"), page.click("#export-json-btn")]);
            const jsonPath = path.join(tmpDir, "backup.json");
            await download.saveAs(jsonPath);

            await page.evaluate(function() { localStorage.clear(); });
            await page.setInputFiles("#import-file", jsonPath);
            await waitForToast(page, "Data restored successfully!");
            assert.deepEqual(await storedEntries(page), entries);
            assert.deepEqual(await page.evaluate(function() { return JSON.parse(localStorage.getItem("userHeight")); }), { feet: "5", inches: "10" });
        });
    });

    it("shows untrusted names and values as text, never as HTML", async function() {
        await withPage({}, async function(page) {
            const evil = '<img src=x onerror="window.pwned=1">';

            await page.goto(BASE + "index.html");
            await page.selectOption("#exercise-name", "other");
            await page.fill("#custom-exercise", evil);
            await page.fill("#exercise-reps", "5");
            await page.click("#add-exercise-button");
            assert.equal(await page.locator("#exercise-queue img").count(), 0);
            assert.ok((await page.locator("#exercise-queue li").textContent()).includes(evil));

            const csvPath = path.join(tmpDir, "evil.csv");
            fs.writeFileSync(csvPath, `Date,Weight,Systolic,Diastolic,Exercises\n2026-10-01,180,120,80,"${evil.replace(/"/g, '""')}: 5 reps"\n`);
            await page.goto(BASE + "logs.html");
            await page.setInputFiles("#import-csv", csvPath);
            await waitForToast(page, "CSV imported successfully!");
            assert.ok((await page.locator(".log-entry li").textContent()).includes(evil));
            await page.click('.log-entry button[data-action="edit"]');
            assert.ok((await page.locator(".edit-form li").textContent()).includes(evil));
            assert.equal(await page.locator("#logs-container img").count(), 0);

            // A value that tries to break out of an input's value attribute
            await seed(page, [entry('2026-10-01" autofocus onfocus="window.pwned=1', "180")]);
            await page.reload();
            await page.click('.log-entry button[data-action="edit"]');
            await page.waitForTimeout(200);
            assert.equal(await page.evaluate(function() { return window.pwned; }), undefined);
        });
    });
});

describe("offline", function() {
    it("precaches the app and draws charts with the network off (needs internet for the first load)", async function() {
        const cacheName = /const CACHE_NAME = '([^']+)'/.exec(fs.readFileSync(path.join(ROOT, "sw.js"), "utf8"))[1];
        await withPage({ serviceWorkers: "allow" }, async function(page) {
            await page.goto(BASE + "logs.html");
            await page.evaluate(function() { return navigator.serviceWorker.ready; });
            await page.waitForFunction(async function(name) {
                const keys = await (await caches.open(name)).keys();
                return keys.filter(function(r) { return r.url.includes("jsdelivr"); }).length === 2;
            }, cacheName);

            await seed(page, [entry("2026-10-01", "180"), entry("2026-10-02", "178")]);
            await page.context().setOffline(true);
            await page.reload();
            await page.waitForSelector(".log-entry");
            assert.deepEqual(await chartsDrawn(page), [true, true, true]);
        });
    });
});
