import { describe, it, expect } from "vitest";
import inventory from "../src/data/tool-inventory.json";
import type { ToolInventory, ToolEntry } from "../src/data/tool-inventory.schema";

const data = inventory as ToolInventory;

describe("tool-inventory", () => {
  it("contains at least 18 vetted launch entries", () => {
    const launch = data.filter(t => t.vetted_for_launch);
    expect(launch.length).toBeGreaterThanOrEqual(18);
  });

  it("every entry has a unique id", () => {
    const ids = data.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every entry has a non-empty synonyms array", () => {
    for (const t of data) {
      expect(t.synonyms.length).toBeGreaterThan(0);
    }
  });

  it("every route starts with a known fork prefix", () => {
    const allowed = ["/pdf", "/image", "/image-pro", "/tools"];
    for (const t of data) {
      const matches = allowed.some(p => t.route.startsWith(p + "/") || t.route === p);
      expect(matches, `route "${t.route}" must start with one of ${allowed.join(", ")}`).toBe(true);
    }
  });

  it("source_app matches the route prefix", () => {
    for (const t of data) {
      if (t.source_app === "pdf") expect(t.route.startsWith("/pdf/")).toBe(true);
      if (t.source_app === "image") expect(t.route.startsWith("/image/")).toBe(true);
      if (t.source_app === "image-pro") expect(t.route.startsWith("/image-pro/")).toBe(true);
      if (t.source_app === "tools") expect(t.route.startsWith("/tools/")).toBe(true);
    }
  });

  it("category matches source_app", () => {
    const m: Record<ToolEntry["source_app"], ToolEntry["category"]> = {
      "pdf": "PDF", "image": "Image", "image-pro": "Image Pro", "tools": "Quick",
    };
    for (const t of data) {
      expect(t.category).toBe(m[t.source_app]);
    }
  });

  it("description is <= 80 characters", () => {
    for (const t of data) {
      expect(t.description.length, `id=${t.id}`).toBeLessThanOrEqual(80);
    }
  });

  it("exactly 4 featured_task entries exist", () => {
    const featured = data.filter(t => t.featured_task);
    expect(featured.length).toBe(4);
  });

  it("every featured_task has required fields", () => {
    for (const t of data) {
      if (t.featured_task) {
        expect(t.featured_task.title).toBeTruthy();
        expect(t.featured_task.description).toBeTruthy();
        expect(t.featured_task.icon).toBeTruthy();
        expect(t.featured_task.label).toBeTruthy();
        expect(t.featured_task.pill).toBeTruthy();
      }
    }
  });
});
