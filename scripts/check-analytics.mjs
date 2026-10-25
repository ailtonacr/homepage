// Tests the actual inline CookieConsent.astro script embedded in generated HTML.
// The DOM, localStorage, and browser APIs are mocked; consent logic is NOT reimplemented.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";

const html = readFileSync(join(process.cwd(), "dist", "index.html"), "utf8");
const source = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1]).find((body) => body.includes("ailton:analytics-consent:v1"));
assert.ok(source, "Expected actual analytics controller in generated HTML");
const id = "G-TEST123456";

function session(stored = null, hasConsentRoot = true) {
  const storage = new Map(stored ? [["ailton:analytics-consent:v1", stored]] : []);
  const handlers = {};
  const scripts = [];
  const listeners = {};
  const focus = { count: 0 };
  const consent = {
    hidden: true,
    getAttribute: (key) => key === "data-measurement-id" ? id : null,
    querySelectorAll: (selector) => selector === "[data-consent]"
      ? ["denied", "granted"].map((value) => ({
          getAttribute: () => value,
          addEventListener: (_event, fn) => { handlers[value] = fn; },
        }))
      : [],
    querySelector: () => ({ focus: () => focus.count++ }),
  };
  const preferences = { hidden: true, addEventListener: (_event, fn) => { handlers.preferences = fn; } };
  const document = {
    querySelector: () => hasConsentRoot ? consent : null,
    querySelectorAll: (selector) => selector === "[data-open-consent]" ? [preferences] : [],
    createElement: () => ({ async: false, src: "" }),
    head: { appendChild: (script) => scripts.push(script) },
    addEventListener: (name, fn) => { listeners[name] = fn; },
  };
  const window = { dataLayer: [], location: { reload: () => { window.reloads++; } }, reloads: 0 };
  const localStorage = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
  vm.runInNewContext(source, { document, window, localStorage, encodeURIComponent, Date });
  function dispatchTrackedEvent() {
    const link = {
      getAttribute: (key) => ({
        "data-track-event": "select_project",
        "data-track-project": "pastemax",
      })[key] ?? null,
    };
    listeners.click?.({ target: { closest: () => link } });
  }
  return { consent, handlers, scripts, storage, window, preferences, focus, dispatchTrackedEvent };
}

const absent = session(null, false);
assert.equal(absent.scripts.length, 0, "No consent root means no GA requests");

const unset = session();
assert.equal(unset.consent.hidden, false, "Prompt must appear with no prior decision");
assert.equal(unset.scripts.length, 0, "GA must not load before opt-in");
unset.dispatchTrackedEvent();
assert.equal(unset.window.dataLayer.length, 0, "No tracking before opt-in");
unset.handlers.denied();
assert.equal(unset.storage.get("ailton:analytics-consent:v1"), "denied");
assert.equal(unset.scripts.length, 0, "Declining must not load GA");

const existingDenied = session("denied");
assert.equal(existingDenied.consent.hidden, true, "Remember previous denial");
assert.equal(existingDenied.scripts.length, 0, "Denied sessions must not load GA");
existingDenied.handlers.preferences();
assert.equal(existingDenied.consent.hidden, false, "Preferences must be reopenable");
assert.equal(existingDenied.focus.count, 1, "Focus should move to the denial button");

const granted = session();
granted.handlers.granted();
assert.equal(granted.storage.get("ailton:analytics-consent:v1"), "granted");
assert.equal(granted.scripts.length, 1, "Acceptance loads exactly one GA script");
assert.ok(granted.scripts[0].src.includes(id));
granted.dispatchTrackedEvent();
assert.ok(granted.window.dataLayer.some((entry) => entry[0] === "event" && entry[1] === "select_project"), "Actual event is forwarded after opt-in");

granted.handlers.preferences();
granted.handlers.denied();
assert.equal(granted.storage.get("ailton:analytics-consent:v1"), "denied");
assert.equal(granted.window["ga-disable-" + id], true, "Revocation disables current GA immediately");
assert.ok(granted.window.dataLayer.some((entry) => entry[0] === "consent" && entry[1] === "update" && entry[2].analytics_storage === "denied"), "Revocation must update Consent Mode");
assert.equal(granted.window.reloads, 1, "Revocation must reload into a no-GA session");
const count = granted.window.dataLayer.length;
granted.dispatchTrackedEvent();
assert.equal(granted.window.dataLayer.length, count, "After revocation, tracked clicks must not emit events");

const persisted = session("granted");
assert.equal(persisted.scripts.length, 1, "Persisted acceptance starts GA");
persisted.handlers.denied();
assert.equal(persisted.window.reloads, 1, "Persisted acceptance can be revoked");
assert.equal(session("denied").scripts.length, 0, "After reloading with denial, no GA script loads");

console.log("Consent regression passed: no root, first visit, denial, acceptance, event gating, persisted choice, revoke + reload.");
