// Drives the locally installed Chrome (no browser download needed).
// Set CHROME_PATH to use a different Chrome/Chromium/Edge executable.
import { chromium } from "playwright-core";

export function launchBrowser() {
    return process.env.CHROME_PATH
        ? chromium.launch({ executablePath: process.env.CHROME_PATH })
        : chromium.launch({ channel: "chrome" });
}

// Opens a fresh, isolated page. Dialogs (confirm) are accepted; page errors are collected.
export async function openPage(browser, options = {}) {
    const context = await browser.newContext({ serviceWorkers: "block", acceptDownloads: true, ...options });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", function(e) { errors.push(e.message); });
    page.on("dialog", function(dialog) { dialog.accept(); });
    return { context, page, errors };
}

export function storedEntries(page) {
    return page.evaluate(function() { return JSON.parse(localStorage.getItem("entries") || "[]"); });
}

export function seed(page, entries, height) {
    return page.evaluate(function([e, h]) {
        localStorage.setItem("entries", JSON.stringify(e));
        if (h) localStorage.setItem("userHeight", JSON.stringify(h));
    }, [entries, height]);
}

export function toastText(page) {
    return page.locator("#toast").textContent();
}

export function waitForToast(page, text) {
    return page.waitForFunction(function(t) {
        return document.getElementById("toast").textContent === t;
    }, text);
}

export function entry(date, weight, extra = {}) {
    return { date, weight, bloodPressure: "120/80", bmi: "25.0", exercises: [], ...extra };
}
