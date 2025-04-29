import { ConfigSchema } from "@ai-rules/types";
import { describe, expect, it } from "vitest";

import { baseConfig } from "../../../src/templates/defaults/base.js";

describe("Base Default Configuration", () => {
    it("validates against ConfigSchema", () => {
        const result = ConfigSchema.safeParse(baseConfig);
        expect(result.success).toBe(true);
    });

    it("contains correct default values", () => {
        expect(baseConfig).toMatchObject({
            version: "1.0.0",
            teams: [],
            typescript: {
                language: "typescript",
            },
            solidity: {
                gasOptimizations: true,
                framework: "foundry",
                testing: {
                    framework: "forge",
                },
            },
        });
    });

    it("contains correct coderabbit defaults", () => {
        expect(baseConfig.coderabbit).toMatchObject({
            language: "en-US",
            tone_instructions: "",
            early_access: false,
            enable_free_tier: false,
            reviews: {
                profile: "chill",
                high_level_summary: true,
                auto_review: {
                    enabled: true,
                    drafts: true,
                },
            },
        });
    });

    it("contains correct tool configurations", () => {
        expect(baseConfig.coderabbit.reviews.tools).toMatchObject({
            shellcheck: { enabled: true },
            ruff: { enabled: false },
            markdownlint: { enabled: true },
            "github-checks": { enabled: true, timeout_ms: 300000 },
        });
    });

    it("contains correct integration defaults", () => {
        expect(baseConfig.coderabbit.chat.integrations).toMatchObject({
            jira: { usage: "disabled" },
            linear: { usage: "enabled" },
        });
    });
});
