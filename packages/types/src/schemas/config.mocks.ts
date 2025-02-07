/**
 * Mock configuration for testing purposes
 */
import { Config } from "./config.js";

/**
 * Complete mock configuration object that satisfies the Config type
 */
export const mockConfig: Config = {
    version: "0.0.1",
    teams: ["offchain", "solidity", "ui"],
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
    coderabbit: {
        language: "en-US",
        tone_instructions: "Maintain a professional and constructive tone",
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
            review_status: true,
            commit_status: true,
            fail_commit_status: false,
            collapse_walkthrough: true,
            changed_files_summary: true,
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
                biome: { enabled: false },
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
                linear: { usage: "disabled" },
            },
        },
        knowledge_base: {
            opt_out: false,
            learnings: {
                scope: "auto",
            },
            issues: {
                scope: "auto",
            },
            jira: {
                usage: "disabled",
                project_keys: [],
            },
            linear: {
                usage: "disabled",
                team_keys: [],
            },
            pull_requests: {
                scope: "auto",
            },
        },
    },
};

/**
 * Minimal mock configuration with only required fields
 */
export const mockMinimalConfig: Config = {
    version: "0.0.1",
    teams: ["offchain"],
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
            review_status: true,
            commit_status: true,
            fail_commit_status: false,
            collapse_walkthrough: true,
            changed_files_summary: true,
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
                biome: { enabled: false },
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
                linear: { usage: "disabled" },
            },
        },
        knowledge_base: {
            opt_out: false,
            learnings: {
                scope: "auto",
            },
            issues: {
                scope: "auto",
            },
            jira: {
                usage: "disabled",
                project_keys: [],
            },
            linear: {
                usage: "disabled",
                team_keys: [],
            },
            pull_requests: {
                scope: "auto",
            },
        },
    },
};
