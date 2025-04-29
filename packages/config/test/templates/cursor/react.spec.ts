import { describe, expect, it } from "vitest";

import { reactRules } from "../../../src/templates/cursor/react.js";

describe("React Cursor Templates", () => {
    it("exports an array of cursor rules", () => {
        expect(Array.isArray(reactRules)).toBe(true);
        expect(reactRules.length).toBeGreaterThan(0);
    });

    it("contains the expected rule definitions", () => {
        const ruleNames = reactRules.map((rule) => rule.name);

        expect(ruleNames).toContain("react-components");
        expect(ruleNames).toContain("react-performance");
        expect(ruleNames).toContain("react-styling");
    });

    it("has required properties for each rule", () => {
        reactRules.forEach((rule) => {
            expect(rule).toHaveProperty("name");
            expect(rule).toHaveProperty("description");
            expect(rule).toHaveProperty("globs");
            expect(rule).toHaveProperty("content");

            expect(typeof rule.name).toBe("string");
            expect(typeof rule.description).toBe("string");
            expect(typeof rule.globs).toBe("string");
            expect(typeof rule.content).toBe("string");
        });
    });

    it("has valid glob patterns", () => {
        reactRules.forEach((rule) => {
            expect(rule.globs).toMatch(/\*\*\/\*\.tsx$/);
        });
    });

    it("has non-empty content for each rule", () => {
        reactRules.forEach((rule) => {
            expect(rule.content.length).toBeGreaterThan(0);
            // Verify the content has markdown headings
            expect(rule.content).toMatch(/^#/m);
        });
    });
});
