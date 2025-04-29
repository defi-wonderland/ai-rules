import * as fsPromises from "fs/promises";
import path from "path";
import type { Config, CursorRule } from "@ai-rules/types";
import type { Stats } from "fs";
import { TeamType } from "@ai-rules/types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as yaml from "yaml";

import { TemplateGenerator } from "../../src/generators/template-generator.js";

vi.mock("fs/promises");
vi.mock("yaml");
vi.mock("@ai-rules/config", () => {
    const mockCoderabbitConfigInternal = {
        language: "en-US",
        tone_instructions: "",
        early_access: false,
        enable_free_tier: false,
        reviews: {
            profile: "chill" as const,
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
                jira: { usage: "disabled" as const },
                linear: { usage: "enabled" as const },
            },
        },
        knowledge_base: {
            opt_out: false,
            learnings: { scope: "auto" as const },
            issues: { scope: "auto" as const },
            jira: { usage: "disabled" as const, project_keys: [] },
            linear: { usage: "enabled" as const, team_keys: [] },
            pull_requests: { scope: "auto" as const },
        },
    };

    return {
        baseConfig: {
            version: "1.0.0",
            coderabbit: mockCoderabbitConfigInternal,
        },
        typescriptRules: [
            {
                name: "ts-rule1",
                description: "TS Rule 1",
                globs: ["*.ts"],
                content: "TS Rule 1 Content",
            },
        ] as CursorRule[],
        reactRules: [
            {
                name: "react-rule1",
                description: "React Rule 1",
                globs: ["*.tsx"],
                content: "React Rule 1 Content",
            },
        ] as CursorRule[],
        solidityRules: [
            {
                name: "sol-rule1",
                description: "Sol Rule 1",
                globs: ["*.sol"],
                content: "Sol Rule 1 Content",
            },
        ] as CursorRule[],
    };
});

describe("TemplateGenerator", () => {
    let generator: TemplateGenerator;
    const mockOutputPath = "/fake/output/path";

    beforeEach(() => {
        vi.resetAllMocks();

        vi.mocked(fsPromises.mkdir).mockResolvedValue(undefined);
        vi.mocked(fsPromises.writeFile).mockResolvedValue(undefined);
        vi.mocked(fsPromises.readFile).mockResolvedValue(Buffer.from("mock content"));
        vi.mocked(fsPromises.stat).mockResolvedValue({ isFile: () => true } as Stats);

        vi.mocked(yaml.stringify).mockReturnValue("mock yaml");
        vi.mocked(yaml.parse).mockReturnValue({ version: "1.0.0" });

        const mockConfig: Config = {
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

        generator = new TemplateGenerator(mockConfig, mockOutputPath);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("creates output directory if it doesn't exist", async () => {
        vi.mocked(fsPromises.stat).mockRejectedValueOnce(new Error("ENOENT"));

        await generator.generateAll();

        expect(fsPromises.mkdir).toHaveBeenCalledWith(mockOutputPath, { recursive: true });
    });

    it("writes Solidity rule files", async () => {
        await generator.generateAll();

        expect(fsPromises.writeFile).toHaveBeenCalledWith(
            path.join(mockOutputPath, ".cursor", "rules", "Solidity", "sol-rule1.mdc"),
            expect.any(String),
            expect.any(String),
        );
    });

    it("creates rule directories when needed", async () => {
        await generator.generateAll();

        expect(fsPromises.mkdir).toHaveBeenCalledWith(
            path.join(mockOutputPath, ".cursor", "rules", "Solidity"),
            { recursive: true },
        );
    });
});
