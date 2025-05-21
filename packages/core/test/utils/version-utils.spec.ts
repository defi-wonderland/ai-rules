import { describe, expect, it } from "vitest";

import { compareVersions } from "../../src/internal/utils/version-utils.js";

describe("compareVersions Utility", () => {
    it("returns positive if first version is greater", () => {
        expect(compareVersions("1.2.3", "1.2.2")).toBeGreaterThan(0);
        expect(compareVersions("1.3.0", "1.2.10")).toBeGreaterThan(0);
        expect(compareVersions("2.0.0", "1.9.9")).toBeGreaterThan(0);
    });

    it("returns negative if first version is lesser", () => {
        expect(compareVersions("1.2.1", "1.2.2")).toBeLessThan(0);
        expect(compareVersions("1.2.10", "1.3.0")).toBeLessThan(0);
        expect(compareVersions("1.9.9", "2.0.0")).toBeLessThan(0);
    });

    it("returns 0 if versions are equal", () => {
        expect(compareVersions("1.2.3", "1.2.3")).toBe(0);
        expect(compareVersions("1.0.0", "1.0.0")).toBe(0);
        expect(compareVersions("0.0.1", "0.0.1")).toBe(0);
    });

    it("handles missing minor or patch versions as zero", () => {
        expect(compareVersions("1.2", "1.1.9")).toBeGreaterThan(0); // 1.2.0 > 1.1.9
        expect(compareVersions("1", "0.9.9")).toBeGreaterThan(0); // 1.0.0 > 0.9.9
        expect(compareVersions("1.1", "1.1.0")).toBe(0); // 1.1.0 === 1.1.0
        expect(compareVersions("1", "1.0.0")).toBe(0); // 1.0.0 === 1.0.0
        expect(compareVersions("1.1.1", "1.2")).toBeLessThan(0); // 1.1.1 < 1.2.0
    });

    it("handles undefined or empty strings as version 0.0.0", () => {
        expect(compareVersions(undefined, "1.0.0")).toBeLessThan(0);
        expect(compareVersions("1.0.0", undefined)).toBeGreaterThan(0);
        expect(compareVersions(undefined, undefined)).toBe(0);
        expect(compareVersions("", "1.0.0")).toBeLessThan(0);
        expect(compareVersions("1.0.0", "")).toBeGreaterThan(0);
        expect(compareVersions("", "")).toBe(0);
        expect(compareVersions(undefined, "")).toBe(0);
        expect(compareVersions("", undefined)).toBe(0);
    });

    it("handles non-numeric version parts as zeros", () => {
        expect(compareVersions("1.x.3", "1.0.3")).toBe(0);
        expect(compareVersions("1.2.beta", "1.2.0")).toBe(0);
        expect(compareVersions("alpha.2.3", "0.2.3")).toBe(0);
        expect(compareVersions("1.0.0-alpha", "1.0.0")).toBe(0);
    });
});
