import { describe, expect, it } from "vitest";
import { isSiteIndexable } from "@/lib/seo";

describe("publicación e indexación", () => {
  it("mantiene cerrados preview y producción antes del lanzamiento", () => {
    expect(isSiteIndexable(undefined, undefined)).toBe(false);
    expect(isSiteIndexable("preview", "true")).toBe(false);
    expect(isSiteIndexable("production", undefined)).toBe(false);
    expect(isSiteIndexable("production", "false")).toBe(false);
  });

  it("indexa sólo la producción lanzada de forma explícita", () => {
    expect(isSiteIndexable("production", "true")).toBe(true);
    expect(isSiteIndexable("production", "TRUE")).toBe(false);
  });
});
