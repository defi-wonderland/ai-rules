/**
 * Common test utilities and mocks
 */
import { vi } from "vitest";

import { Config } from "../../src/internal/schemas/config.js";

/**
 * Creates a standard mock configuration for tests
 * @returns A valid Config object for testing
 */
export function createMockConfig(): Config {
    return {
        version: "1.0.0",
        teams: ["offchain", "solidity", "ui"],
        typescript: { language: "typescript" },
        solidity: {
            gasOptimizations: true,
            framework: "foundry",
            testing: { framework: "forge" },
        },
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
                    docstrings: {
                        enabled: true,
                    },
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
                jira: {
                    usage: "disabled",
                    project_keys: [],
                },
                linear: {
                    usage: "enabled",
                    team_keys: [],
                },
                pull_requests: { scope: "auto" },
            },
        },
    };
}

/**
 * Standard mock paths for testing
 */
export const TEST_PATHS = {
    BASE_PATH: "/test/path",
    CONFIG_FILE: "config.json",
};

/**
 * Creates common mock provider methods
 * @returns Object with mock methods for a config provider
 */
export function createMockProvider() {
    return {
        readConfig: vi.fn(),
        writeConfig: vi.fn(),
        exists: vi.fn(),
    };
}
