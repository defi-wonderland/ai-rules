import { describe, expect, it } from "vitest";

import { solidityRules } from "../../../src/templates/cursor/solidity.js";

describe("Solidity Cursor Templates", () => {
    it("exports an array of cursor rules", () => {
        expect(Array.isArray(solidityRules)).toBe(true);
        expect(solidityRules.length).toBeGreaterThan(0);
    });

    it("contains the expected rule definitions", () => {
        const ruleNames = solidityRules.map((rule) => rule.name);

        expect(ruleNames).toContain("solidity-base");
        expect(ruleNames).toContain("solidity-security");
        expect(ruleNames).toContain("solidity-gas");
        expect(ruleNames).toContain("solidity-tests");
    });

    it("has required properties for each rule", () => {
        solidityRules.forEach((rule) => {
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
        // The base rules should target Solidity files
        const baseRules = solidityRules.filter((rule) => rule.name !== "solidity-tests");
        baseRules.forEach((rule) => {
            expect(rule.globs).toMatch(/\*\*\/\*\.sol$/);
        });

        // Test-specific rule should target test files
        const testRule = solidityRules.find((rule) => rule.name === "solidity-tests");
        expect(testRule?.globs).toMatch(/\*\*\/t\.sol$/);
    });

    it("has non-empty content for each rule", () => {
        solidityRules.forEach((rule) => {
            expect(rule.content.length).toBeGreaterThan(0);
            // Verify the content has markdown headings
            expect(rule.content).toMatch(/^#/m);
        });
    });

    it("includes security and gas optimization guidelines", () => {
        const securityRule = solidityRules.find((rule) => rule.name === "solidity-security");
        const gasRule = solidityRules.find((rule) => rule.name === "solidity-gas");

        expect(securityRule?.content).toContain("Security Pattern");
        expect(gasRule?.content).toContain("Gas Optimization");
    });
});
