import { describe, expect, it } from "vitest";

import { typescriptRules } from "../../../src/templates/cursor/typescript.js";

describe("TypeScript Cursor Templates", () => {
    it("exports an array of cursor rules", () => {
        expect(Array.isArray(typescriptRules)).toBe(true);
        expect(typescriptRules.length).toBeGreaterThan(0);
    });

    it("contains the expected rule definitions", () => {
        const ruleNames = typescriptRules.map((rule) => rule.name);

        expect(ruleNames).toContain("typescript-base");
        expect(ruleNames).toContain("typescript-services");
        expect(ruleNames).toContain("typescript-providers");
        expect(ruleNames).toContain("typescript-scripts");
        expect(ruleNames).toContain("typescript-tests");
        expect(ruleNames).toContain("typescript-errors");
    });

    it("has required properties for each rule", () => {
        typescriptRules.forEach((rule) => {
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

    it("has appropriate glob patterns for different rule types", () => {
        // Check glob patterns for specific rules
        const baseRule = typescriptRules.find((rule) => rule.name === "typescript-base");
        const servicesRule = typescriptRules.find((rule) => rule.name === "typescript-services");
        const providersRule = typescriptRules.find((rule) => rule.name === "typescript-providers");
        const scriptsRule = typescriptRules.find((rule) => rule.name === "typescript-scripts");
        const testsRule = typescriptRules.find((rule) => rule.name === "typescript-tests");
        const errorsRule = typescriptRules.find((rule) => rule.name === "typescript-errors");

        expect(baseRule?.globs).toMatch(/\*\*\/\*\.ts$/);
        expect(servicesRule?.globs).toMatch(/\*\*\/services\/\*\*\/\*\.ts$/);
        expect(providersRule?.globs).toMatch(/\*\*\/providers\/\*\*\/\*\.ts$/);
        expect(scriptsRule?.globs).toMatch(/scripts\/\*\*\/\*\.ts$/);
        expect(testsRule?.globs).toMatch(/\*\*\/\*\.test\.ts$/);
        expect(errorsRule?.globs).toMatch(/\*\*\/errors\/\*\*\/\*\.ts$/);
    });

    it("has non-empty content for each rule", () => {
        typescriptRules.forEach((rule) => {
            expect(rule.content.length).toBeGreaterThan(0);
            // Verify the content has markdown headings
            expect(rule.content).toMatch(/^#/m);
        });
    });

    it("includes type safety guidelines", () => {
        const baseRule = typescriptRules.find((rule) => rule.name === "typescript-base");
        expect(baseRule?.content).toContain("Type Safety");
        expect(baseRule?.content).toContain("Avoid `any`");
    });

    it("includes architectural guidelines for services and providers", () => {
        const servicesRule = typescriptRules.find((rule) => rule.name === "typescript-services");
        const providersRule = typescriptRules.find((rule) => rule.name === "typescript-providers");

        expect(servicesRule?.content).toContain("Architecture");
        expect(providersRule?.content).toContain("Architecture");
    });
});
