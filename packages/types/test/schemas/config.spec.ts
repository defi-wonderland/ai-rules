import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
    BaseConfigSchema,
    ConfigSchema,
    OffchainLanguageConfigSchema,
    SolidityConfigSchema,
    TeamType,
} from "../../src/schemas/index.js";

const mockConfig = {
    version: "1.0.0",
    teams: [TeamType.enum.solidity],
    coderabbit: {
        language: "en-US",
        tone_instructions: "",
        early_access: false,
        enable_free_tier: false,
        reviews: {
            profile: "chill",
            request_changes_workflow: false,
            high_level_summary: true,
            high_level_summary_placeholder: "@coderabbitai summary",
            high_level_summary_in_walkthrough: false,
            auto_title_placeholder: "@coderabbitai",
            auto_title_instructions: "",
            review_status: false,
            commit_status: false,
            fail_commit_status: false,
            collapse_walkthrough: true,
            changed_files_summary: false,
            sequence_diagrams: false,
            assess_linked_issues: true,
            related_issues: true,
            related_prs: true,
            suggested_labels: false,
            auto_apply_labels: false,
            suggested_reviewers: false,
            poem: false,
            labeling_instructions: [],
            path_filters: [],
            path_instructions: [],
            abort_on_close: true,
            auto_review: {
                enabled: true,
                auto_incremental_review: true,
                ignore_title_keywords: [],
                labels: [],
                drafts: true,
                base_branches: [],
            },
            finishing_touches: {
                docstrings: { enabled: true },
            },
            tools: {
                shellcheck: { enabled: true },
                ruff: { enabled: false },
                markdownlint: { enabled: true },
                "github-checks": { enabled: true, timeout_ms: 300000 },
                languagetool: { enabled: true, enabled_only: false, level: "default" },
                biome: { enabled: true },
                hadolint: { enabled: true },
                swiftlint: { enabled: false },
                phpstan: { enabled: false, level: "default" },
                "golangci-lint": { enabled: false },
                yamllint: { enabled: true },
                gitleaks: { enabled: true },
                checkov: { enabled: true },
                detekt: { enabled: false },
                eslint: { enabled: false },
                rubocop: { enabled: false },
                buf: { enabled: false },
                regal: { enabled: false },
                actionlint: { enabled: true },
                pmd: { enabled: false },
                cppcheck: { enabled: false },
                semgrep: { enabled: false },
                circleci: { enabled: false },
            },
        },
        chat: {
            auto_reply: true,
            integrations: {
                jira: { usage: "disabled" },
                linear: { usage: "enabled" },
            },
        },
        knowledge_base: {
            opt_out: false,
            learnings: { scope: "auto" },
            issues: { scope: "auto" },
            jira: { usage: "disabled", project_keys: [] },
            linear: { usage: "enabled", team_keys: [] },
            pull_requests: { scope: "auto" },
        },
    },
};

describe("Configuration Schemas", () => {
    describe("TeamType", () => {
        it("parses valid team types", () => {
            expect(TeamType.parse("offchain")).toBe("offchain");
            expect(TeamType.parse("solidity")).toBe("solidity");
            expect(TeamType.parse("ui")).toBe("ui");
        });

        it("rejects invalid team types", () => {
            expect(() => TeamType.parse("backend")).toThrow(z.ZodError);
        });
    });

    describe("BaseConfigSchema", () => {
        it("parses valid base config", () => {
            const data = { version: "1.0.0", teams: [TeamType.enum.offchain] };
            expect(BaseConfigSchema.parse(data)).toEqual(data);
        });

        it("rejects missing version", () => {
            const data = { teams: [TeamType.enum.solidity] };
            expect(() => BaseConfigSchema.parse(data)).toThrow(z.ZodError);
        });
        it("rejects invalid team type in array", () => {
            const data = { version: "1.0.0", teams: ["invalid-team"] };
            expect(() => BaseConfigSchema.parse(data)).toThrow(z.ZodError);
        });
    });

    describe("OffchainLanguageConfigSchema", () => {
        it("parses valid offchain languages", () => {
            expect(OffchainLanguageConfigSchema.parse({ language: "typescript" })).toEqual({
                language: "typescript",
            });
            expect(OffchainLanguageConfigSchema.parse({ language: "javascript" })).toEqual({
                language: "javascript",
            });
        });

        it("rejects invalid language", () => {
            expect(() => OffchainLanguageConfigSchema.parse({ language: "python" })).toThrow(
                z.ZodError,
            );
        });
        it("rejects missing language", () => {
            expect(() => OffchainLanguageConfigSchema.parse({})).toThrow(z.ZodError);
        });
    });

    describe("SolidityConfigSchema", () => {
        it("parses valid solidity config", () => {
            const data = { gasOptimizations: false };
            const expected = {
                gasOptimizations: false,
                framework: "foundry",
                testing: { framework: "forge" },
            };
            expect(SolidityConfigSchema.parse(data)).toEqual(expected);
        });

        it("applies default values", () => {
            const data = {};
            const expected = {
                gasOptimizations: true,
                framework: "foundry",
                testing: { framework: "forge" },
            };
            const result = SolidityConfigSchema.safeParse(data);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(expected);
            }
        });

        it("parses config with explicit testing framework", () => {
            const data = { gasOptimizations: true, testing: { framework: "forge" } };
            const expected = {
                gasOptimizations: true,
                framework: "foundry",
                testing: { framework: "forge" },
            };
            expect(SolidityConfigSchema.parse(data)).toEqual(expected);
        });

        it("rejects invalid gasOptimizations type", () => {
            expect(() => SolidityConfigSchema.parse({ gasOptimizations: "yes" })).toThrow(
                z.ZodError,
            );
        });

        it("rejects invalid framework", () => {
            expect(() => SolidityConfigSchema.parse({ framework: "hardhat" })).toThrow(z.ZodError);
        });
        it("rejects invalid testing framework", () => {
            expect(() => SolidityConfigSchema.parse({ testing: { framework: "truffle" } })).toThrow(
                z.ZodError,
            );
        });
    });

    describe("ConfigSchema", () => {
        it("parses a complete and valid mock config", () => {
            const result = ConfigSchema.safeParse(mockConfig);
            expect(
                result.success,
                JSON.stringify(result.success ? {} : result.error.format(), null, 2),
            ).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(mockConfig);
            }
        });

        it("parses config with only base fields and one team", () => {
            const data = {
                version: "0.1.0",
                teams: [TeamType.enum.ui],
            };
            const result = ConfigSchema.safeParse(data);
            expect(
                result.success,
                JSON.stringify(result.success ? {} : result.error.format(), null, 2),
            ).toBe(true);
            if (result.success) {
                expect(result.data.version).toBe("0.1.0");
                expect(result.data.teams).toEqual([TeamType.enum.ui]);
                expect(result.data.typescript).toBeUndefined();
                expect(result.data.solidity).toBeUndefined();
                expect(result.data.coderabbit?.language).toBe("en-US");
            }
        });

        it("parses config with optional solidity fields present", () => {
            const data = {
                version: "0.1.0",
                teams: [TeamType.enum.solidity],
                solidity: { gasOptimizations: false },
            };
            const result = ConfigSchema.safeParse(data);
            expect(
                result.success,
                JSON.stringify(result.success ? {} : result.error.format(), null, 2),
            ).toBe(true);
            if (result.success) {
                expect(result.data.solidity?.gasOptimizations).toBe(false);
                expect(result.data.solidity?.framework).toBe("foundry");
            }
        });

        it("parses config with optional typescript fields present", () => {
            const data = {
                version: "0.1.0",
                teams: [TeamType.enum.offchain],
                typescript: { language: "javascript" },
            };
            const result = ConfigSchema.safeParse(data);
            expect(
                result.success,
                JSON.stringify(result.success ? {} : result.error.format(), null, 2),
            ).toBe(true);
            if (result.success) {
                expect(result.data.typescript?.language).toBe("javascript");
            }
        });

        it("rejects config with invalid structure in optional fields", () => {
            const data = {
                version: "0.1.0",
                teams: [TeamType.enum.solidity],
                solidity: {
                    gasOptimizations: "invalid-type",
                    framework: 123,
                    testing: "not-an-object",
                },
            };
            const result = ConfigSchema.safeParse(data);
            expect(result.success).toBe(false);
        });

        it("rejects config missing base fields", () => {
            const data = {
                teams: [TeamType.enum.solidity],
                solidity: { gasOptimizations: true },
            };
            const result = ConfigSchema.safeParse(data);
            expect(result.success).toBe(false);
        });

        it("applies coderabbit defaults when coderabbit section is omitted", () => {
            const data = { version: "1.0.0", teams: [TeamType.enum.ui] };
            const result = ConfigSchema.parse(data);
            expect(result.coderabbit?.language).toBe("en-US");
            expect(result.coderabbit?.reviews?.profile).toBe("chill");
            expect(result.coderabbit?.reviews?.auto_review?.enabled).toBe(true);
        });

        it("parses config with custom coderabbit settings", () => {
            const data = {
                version: "1.0.0",
                teams: [TeamType.enum.ui],
                coderabbit: {
                    language: "fr-FR",
                    reviews: {
                        profile: "assertive",
                        auto_review: { enabled: false },
                    },
                },
            };
            const result = ConfigSchema.parse(data);
            expect(result.coderabbit?.language).toBe("fr-FR");
            expect(result.coderabbit?.reviews?.profile).toBe("assertive");
            expect(result.coderabbit?.reviews?.auto_review?.enabled).toBe(false);
            expect(result.coderabbit?.reviews?.high_level_summary).toBe(true);
        });
    });
});
