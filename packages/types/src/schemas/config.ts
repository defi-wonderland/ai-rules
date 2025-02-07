/**
 * Base configuration schema for AI Rules
 */
import { z } from "zod";

/**
 * Supported team types
 */
export const TeamType = z.enum(["offchain", "solidity", "ui"]);
export type TeamType = z.infer<typeof TeamType>;

/**
 * Base configuration for all teams
 */
export const BaseConfigSchema = z.object({
    version: z.string(),
    teams: z.array(TeamType),
});

export type BaseConfig = z.infer<typeof BaseConfigSchema>;

/**
 * Offchain team specific language configuration
 */
export const OffchainLanguageConfigSchema = z.object({
    language: z.enum(["typescript", "javascript"]),
});

export type OffchainLanguageConfig = z.infer<typeof OffchainLanguageConfigSchema>;

/**
 * Solidity-specific configuration
 */
export const SolidityConfigSchema = z.object({
    gasOptimizations: z.boolean().default(true),
    framework: z.enum(["foundry"]).default("foundry"),
    testing: z
        .object({
            framework: z.enum(["forge"]).default("forge"),
        })
        .default({}),
});

export type SolidityConfig = z.infer<typeof SolidityConfigSchema>;

/**
 * Complete configuration schema combining all team-specific configurations
 */
export const ConfigSchema = BaseConfigSchema.extend({
    typescript: OffchainLanguageConfigSchema.optional(),
    solidity: SolidityConfigSchema.optional(),
    coderabbit: z
        .object({
            /** Language for reviews using ISO language code */
            language: z.string().default("en-US"),
            /** Custom instructions for review tone (max 250 chars) */
            tone_instructions: z.string().default(""),
            /** Enable early-access features */
            early_access: z.boolean().default(false),
            /** Enable features for users not on paid plans */
            enable_free_tier: z.boolean().default(false),
            reviews: z
                .object({
                    /** Review profile - assertive yields more detailed feedback */
                    profile: z.enum(["assertive", "chill"]).default("chill"),
                    /** Approve review once comments are resolved */
                    request_changes_workflow: z.boolean().default(false),
                    /** Generate PR/MR description summary */
                    high_level_summary: z.boolean().default(true),
                    /** Placeholder text for high level summary */
                    high_level_summary_placeholder: z.string().default("@coderabbitai summary"),
                    /** Include summary in walkthrough comment */
                    high_level_summary_in_walkthrough: z.boolean().default(false),
                    /** Keyword for auto-generating PR title */
                    auto_title_placeholder: z.string().default("@coderabbitai"),
                    /** Custom instructions for auto-generating PR title */
                    auto_title_instructions: z.string().default(""),
                    /** Post review details and skip status */
                    review_status: z.boolean().default(true),
                    /** Set commit status during review process */
                    commit_status: z.boolean().default(true),
                    /** Set failure status when review not possible */
                    fail_commit_status: z.boolean().default(false),
                    /** Use collapsible section for walkthrough */
                    collapse_walkthrough: z.boolean().default(true),
                    /** Include file changes summary */
                    changed_files_summary: z.boolean().default(true),
                    /** Generate sequence diagrams in walkthrough */
                    sequence_diagrams: z.boolean().default(false),
                    /** Analyze linked issue coverage */
                    assess_linked_issues: z.boolean().default(true),
                    /** Show related issues */
                    related_issues: z.boolean().default(true),
                    /** Show related pull requests */
                    related_prs: z.boolean().default(true),
                    /** Suggest labels based on changes */
                    suggested_labels: z.boolean().default(false),
                    /** Auto-apply suggested labels */
                    auto_apply_labels: z.boolean().default(false),
                    /** Suggest reviewers based on changes */
                    suggested_reviewers: z.boolean().default(false),
                    /** Generate review poem */
                    poem: z.boolean().default(false),
                    /** Custom label suggestion rules */
                    labeling_instructions: z
                        .array(
                            z.object({
                                label: z.string(),
                                instructions: z.string().max(3000),
                            }),
                        )
                        .default([]),
                    /** File patterns to include/exclude (glob) */
                    path_filters: z.array(z.string()).default([]),
                    /** Path-specific review guidelines */
                    path_instructions: z
                        .array(
                            z.object({
                                path: z.string(),
                                instructions: z.string().max(3000),
                            }),
                        )
                        .default([]),
                    /** Stop review if PR closed/merged */
                    abort_on_close: z.boolean().default(true),
                    /** Auto-review configuration */
                    auto_review: z
                        .object({
                            /** Enable automatic code review */
                            enabled: z.boolean().default(true),
                            /** Review on each push */
                            auto_incremental_review: z.boolean().default(true),
                            /** Skip review for titles with these words */
                            ignore_title_keywords: z.array(z.string()).default([]),
                            /** Only review PRs with these labels */
                            labels: z.array(z.string()).default([]),
                            /** Review draft PRs */
                            drafts: z.boolean().default(true),
                            /** Additional base branches to review */
                            base_branches: z.array(z.string()).default([]),
                        })
                        .default({}),
                    /** Additional review features */
                    finishing_touches: z
                        .object({
                            /** Docstring generation settings */
                            docstrings: z
                                .object({
                                    enabled: z.boolean().default(true),
                                })
                                .default({}),
                        })
                        .default({}),
                    /** Static analysis tools configuration */
                    tools: z
                        .object({
                            shellcheck: z
                                .object({ enabled: z.boolean() })
                                .default({ enabled: true }),
                            ruff: z.object({ enabled: z.boolean() }).default({ enabled: false }),
                            markdownlint: z
                                .object({ enabled: z.boolean() })
                                .default({ enabled: true }),
                            "github-checks": z
                                .object({
                                    enabled: z.boolean(),
                                    timeout_ms: z.number().default(300000),
                                })
                                .default({ enabled: true, timeout_ms: 300000 }),
                            languagetool: z
                                .object({
                                    enabled: z.boolean(),
                                    enabled_only: z.boolean(),
                                    level: z.string(),
                                })
                                .default({ enabled: true, enabled_only: false, level: "default" }),
                            biome: z.object({ enabled: z.boolean() }).default({ enabled: true }),
                            hadolint: z.object({ enabled: z.boolean() }).default({ enabled: true }),
                            swiftlint: z
                                .object({ enabled: z.boolean() })
                                .default({ enabled: false }),
                            phpstan: z
                                .object({
                                    enabled: z.boolean(),
                                    level: z.string(),
                                })
                                .default({ enabled: false, level: "default" }),
                            "golangci-lint": z
                                .object({ enabled: z.boolean() })
                                .default({ enabled: false }),
                            yamllint: z.object({ enabled: z.boolean() }).default({ enabled: true }),
                            gitleaks: z.object({ enabled: z.boolean() }).default({ enabled: true }),
                            checkov: z.object({ enabled: z.boolean() }).default({ enabled: true }),
                            detekt: z.object({ enabled: z.boolean() }).default({ enabled: false }),
                            eslint: z.object({ enabled: z.boolean() }).default({ enabled: false }),
                            rubocop: z.object({ enabled: z.boolean() }).default({ enabled: false }),
                            buf: z.object({ enabled: z.boolean() }).default({ enabled: false }),
                            regal: z.object({ enabled: z.boolean() }).default({ enabled: false }),
                            actionlint: z
                                .object({ enabled: z.boolean() })
                                .default({ enabled: true }),
                            pmd: z.object({ enabled: z.boolean() }).default({ enabled: false }),
                            cppcheck: z
                                .object({ enabled: z.boolean() })
                                .default({ enabled: false }),
                            semgrep: z.object({ enabled: z.boolean() }).default({ enabled: false }),
                            circleci: z
                                .object({ enabled: z.boolean() })
                                .default({ enabled: false }),
                        })
                        .default({}),
                })
                .default({}),
            /** Chat configuration */
            chat: z
                .object({
                    /** Enable automatic bot replies */
                    auto_reply: z.boolean().default(true),
                    integrations: z
                        .object({
                            /** Jira integration settings */
                            jira: z
                                .object({
                                    usage: z
                                        .enum(["auto", "enabled", "disabled"])
                                        .default("disabled"),
                                })
                                .default({}),
                            /** Linear integration settings */
                            linear: z
                                .object({
                                    usage: z
                                        .enum(["auto", "enabled", "disabled"])
                                        .default("enabled"),
                                })
                                .default({}),
                        })
                        .default({}),
                })
                .default({}),
            /** Knowledge base settings */
            knowledge_base: z
                .object({
                    /** Opt out of data retention features */
                    opt_out: z.boolean().default(false),
                    /** Learning scope configuration */
                    learnings: z
                        .object({
                            scope: z.enum(["local", "global", "auto"]).default("auto"),
                        })
                        .default({}),
                    /** Issue tracking configuration */
                    issues: z
                        .object({
                            scope: z.enum(["local", "global", "auto"]).default("auto"),
                        })
                        .default({}),
                    /** Jira knowledge base integration */
                    jira: z
                        .object({
                            usage: z.enum(["auto", "enabled", "disabled"]).default("disabled"),
                            project_keys: z.array(z.string()).default([]),
                        })
                        .default({}),
                    /** Linear knowledge base integration */
                    linear: z
                        .object({
                            usage: z.enum(["auto", "enabled", "disabled"]).default("enabled"),
                            team_keys: z.array(z.string()).default([]),
                        })
                        .default({}),
                    /** Pull request knowledge base settings */
                    pull_requests: z
                        .object({
                            scope: z.enum(["local", "global", "auto"]).default("auto"),
                        })
                        .default({}),
                })
                .default({}),
        })
        .default({}),
});

export type Config = z.infer<typeof ConfigSchema>;

/**
 * Configuration validation result
 */
export type ValidationResult = {
    success: boolean;
    errors?: z.ZodError;
};
