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
    // CodeRabbit schema defined here: https://storage.googleapis.com/coderabbit_public_assets/schema.v2.json
    coderabbit: z
        .object({
            language: z
                .string()
                .describe("Language for reviews using ISO language code")
                .default("en-US"),
            tone_instructions: z
                .string()
                .describe("Custom instructions for review tone (max 250 chars)")
                .default(""),
            early_access: z.boolean().describe("Enable early-access features").default(false),
            enable_free_tier: z
                .boolean()
                .describe("Enable features for users not on paid plans")
                .default(false),
            reviews: z
                .object({
                    profile: z
                        .enum(["assertive", "chill"])
                        .describe("Review profile - assertive yields more detailed feedback")
                        .default("chill"),
                    request_changes_workflow: z
                        .boolean()
                        .describe("Approve review once comments are resolved")
                        .default(false),
                    high_level_summary: z
                        .boolean()
                        .describe("Generate PR/MR description summary")
                        .default(true),
                    high_level_summary_placeholder: z
                        .string()
                        .describe("Placeholder text for high level summary")
                        .default("@coderabbitai summary"),
                    high_level_summary_in_walkthrough: z
                        .boolean()
                        .describe("Include summary in walkthrough comment")
                        .default(false),
                    auto_title_placeholder: z
                        .string()
                        .describe("Keyword for auto-generating PR title")
                        .default("@coderabbitai"),
                    auto_title_instructions: z
                        .string()
                        .describe("Custom instructions for auto-generating PR title")
                        .default(""),
                    review_status: z
                        .boolean()
                        .describe("Post review details and skip status")
                        .default(true),
                    commit_status: z
                        .boolean()
                        .describe("Set commit status during review process")
                        .default(true),
                    fail_commit_status: z
                        .boolean()
                        .describe("Set failure status when review not possible")
                        .default(false),
                    collapse_walkthrough: z
                        .boolean()
                        .describe("Use collapsible section for walkthrough")
                        .default(true),
                    changed_files_summary: z
                        .boolean()
                        .describe("Include file changes summary")
                        .default(true),
                    sequence_diagrams: z
                        .boolean()
                        .describe("Generate sequence diagrams in walkthrough")
                        .default(false),
                    assess_linked_issues: z
                        .boolean()
                        .describe("Analyze linked issue coverage")
                        .default(true),
                    related_issues: z.boolean().describe("Show related issues").default(true),
                    related_prs: z.boolean().describe("Show related pull requests").default(true),
                    suggested_labels: z
                        .boolean()
                        .describe("Suggest labels based on changes")
                        .default(false),
                    auto_apply_labels: z
                        .boolean()
                        .describe("Auto-apply suggested labels")
                        .default(false),
                    suggested_reviewers: z
                        .boolean()
                        .describe("Suggest reviewers based on changes")
                        .default(false),
                    poem: z.boolean().describe("Generate review poem").default(false),
                    labeling_instructions: z
                        .array(
                            z.object({
                                label: z.string().describe("The label to apply"),
                                instructions: z
                                    .string()
                                    .describe("Instructions for when to apply this label")
                                    .max(3000),
                            }),
                        )
                        .describe("Custom label suggestion rules")
                        .default([]),
                    path_filters: z
                        .array(z.string())
                        .describe("File patterns to include/exclude (glob) for reviews")
                        .default([]),
                    path_instructions: z
                        .array(
                            z.object({
                                path: z.string().describe("Glob pattern for the path"),
                                instructions: z
                                    .string()
                                    .describe("Specific review instructions for this path")
                                    .max(3000),
                            }),
                        )
                        .describe("Path-specific review guidelines")
                        .default([]),
                    abort_on_close: z
                        .boolean()
                        .describe("Stop review if PR closed/merged")
                        .default(true),
                    auto_review: z
                        .object({
                            enabled: z
                                .boolean()
                                .describe("Enable automatic code review")
                                .default(true),
                            auto_incremental_review: z
                                .boolean()
                                .describe("Review on each push")
                                .default(true),
                            ignore_title_keywords: z
                                .array(z.string())
                                .describe("Skip review for titles with these words")
                                .default([]),
                            labels: z
                                .array(z.string())
                                .describe("Only review PRs with these labels")
                                .default([]),
                            drafts: z.boolean().describe("Review draft PRs").default(true),
                            base_branches: z
                                .array(z.string())
                                .describe("Additional base branches to review")
                                .default([]),
                        })
                        .describe("Auto-review configuration")
                        .default({}),
                    finishing_touches: z
                        .object({
                            docstrings: z
                                .object({
                                    enabled: z
                                        .boolean()
                                        .describe("Enable docstring generation suggestions")
                                        .default(true),
                                })
                                .describe("Docstring generation settings")
                                .default({}),
                        })
                        .describe("Additional review features")
                        .default({}),
                    tools: z
                        .object({
                            shellcheck: z
                                .object({ enabled: z.boolean().describe("Enable shellcheck tool") })
                                .describe("Shellcheck tool configuration")
                                .default({ enabled: true }),
                            ruff: z
                                .object({ enabled: z.boolean().describe("Enable ruff tool") })
                                .describe("Ruff tool configuration")
                                .default({ enabled: false }),
                            markdownlint: z
                                .object({
                                    enabled: z.boolean().describe("Enable markdownlint tool"),
                                })
                                .describe("Markdownlint tool configuration")
                                .default({ enabled: true }),
                            "github-checks": z
                                .object({
                                    enabled: z
                                        .boolean()
                                        .describe("Enable GitHub checks integration"),
                                    timeout_ms: z
                                        .number()
                                        .describe("Timeout in milliseconds for GitHub checks")
                                        .default(300000),
                                })
                                .describe("GitHub checks integration configuration")
                                .default({ enabled: true, timeout_ms: 300000 }),
                            languagetool: z
                                .object({
                                    enabled: z.boolean().describe("Enable LanguageTool"),
                                    enabled_only: z
                                        .boolean()
                                        .describe("Enable only specified rules for LanguageTool"),
                                    level: z.string().describe("LanguageTool sensitivity level"),
                                })
                                .describe("LanguageTool configuration")
                                .default({ enabled: true, enabled_only: false, level: "default" }),
                            biome: z
                                .object({ enabled: z.boolean().describe("Enable Biome tool") })
                                .describe("Biome tool configuration")
                                .default({ enabled: true }),
                            hadolint: z
                                .object({
                                    enabled: z
                                        .boolean()
                                        .describe("Enable Hadolint tool for Dockerfile linting"),
                                })
                                .describe("Hadolint tool configuration")
                                .default({ enabled: true }),
                            swiftlint: z
                                .object({ enabled: z.boolean().describe("Enable SwiftLint tool") })
                                .describe("SwiftLint tool configuration")
                                .default({ enabled: false }),
                            phpstan: z
                                .object({
                                    enabled: z.boolean().describe("Enable PHPStan tool"),
                                    level: z.string().describe("PHPStan analysis level"),
                                })
                                .describe("PHPStan tool configuration")
                                .default({ enabled: false, level: "default" }),
                            "golangci-lint": z
                                .object({
                                    enabled: z.boolean().describe("Enable golangci-lint tool"),
                                })
                                .describe("golangci-lint tool configuration")
                                .default({ enabled: false }),
                            yamllint: z
                                .object({ enabled: z.boolean().describe("Enable yamllint tool") })
                                .describe("yamllint tool configuration")
                                .default({ enabled: true }),
                            gitleaks: z
                                .object({
                                    enabled: z
                                        .boolean()
                                        .describe("Enable Gitleaks tool for secret detection"),
                                })
                                .describe("Gitleaks tool configuration")
                                .default({ enabled: true }),
                            checkov: z
                                .object({
                                    enabled: z
                                        .boolean()
                                        .describe("Enable Checkov tool for IaC scanning"),
                                })
                                .describe("Checkov tool configuration")
                                .default({ enabled: true }),
                            detekt: z
                                .object({
                                    enabled: z
                                        .boolean()
                                        .describe("Enable Detekt tool for Kotlin static analysis"),
                                })
                                .describe("Detekt tool configuration")
                                .default({ enabled: false }),
                            eslint: z
                                .object({ enabled: z.boolean().describe("Enable ESLint tool") })
                                .describe("ESLint tool configuration")
                                .default({ enabled: false }),
                            rubocop: z
                                .object({
                                    enabled: z
                                        .boolean()
                                        .describe("Enable RuboCop tool for Ruby static analysis"),
                                })
                                .describe("RuboCop tool configuration")
                                .default({ enabled: false }),
                            buf: z
                                .object({
                                    enabled: z
                                        .boolean()
                                        .describe("Enable Buf tool for Protobuf linting"),
                                })
                                .describe("Buf tool configuration")
                                .default({ enabled: false }),
                            regal: z
                                .object({
                                    enabled: z
                                        .boolean()
                                        .describe("Enable Regal tool for Rego linting"),
                                })
                                .describe("Regal tool configuration")
                                .default({ enabled: false }),
                            actionlint: z
                                .object({
                                    enabled: z
                                        .boolean()
                                        .describe(
                                            "Enable actionlint tool for GitHub Actions linting",
                                        ),
                                })
                                .describe("actionlint tool configuration")
                                .default({ enabled: true }),
                            pmd: z
                                .object({
                                    enabled: z
                                        .boolean()
                                        .describe("Enable PMD tool for Java static analysis"),
                                })
                                .describe("PMD tool configuration")
                                .default({ enabled: false }),
                            cppcheck: z
                                .object({
                                    enabled: z
                                        .boolean()
                                        .describe("Enable Cppcheck tool for C/C++ static analysis"),
                                })
                                .describe("Cppcheck tool configuration")
                                .default({ enabled: false }),
                            semgrep: z
                                .object({
                                    enabled: z
                                        .boolean()
                                        .describe("Enable Semgrep tool for static analysis"),
                                })
                                .describe("Semgrep tool configuration")
                                .default({ enabled: false }),
                            circleci: z
                                .object({
                                    enabled: z
                                        .boolean()
                                        .describe("Enable CircleCI configuration validation"),
                                })
                                .describe("CircleCI validation tool configuration")
                                .default({ enabled: false }),
                        })
                        .describe("Static analysis tools configuration")
                        .default({}),
                })
                .describe("Review settings")
                .default({}),
            chat: z
                .object({
                    auto_reply: z
                        .boolean()
                        .describe("Enable automatic bot replies in chat")
                        .default(true),
                    integrations: z
                        .object({
                            jira: z
                                .object({
                                    usage: z
                                        .enum(["auto", "enabled", "disabled"])
                                        .describe("Jira integration settings")
                                        .default("disabled"),
                                })
                                .describe("Jira integration settings")
                                .default({}),
                            linear: z
                                .object({
                                    usage: z
                                        .enum(["auto", "enabled", "disabled"])
                                        .describe("Linear integration settings")
                                        .default("enabled"),
                                })
                                .describe("Linear integration settings")
                                .default({}),
                        })
                        .describe("Project manager integration settings")
                        .default({}),
                })
                .describe("Project manager configuration")
                .default({}),
            knowledge_base: z
                .object({
                    opt_out: z
                        .boolean()
                        .describe("Opt out of data retention features for knowledge base")
                        .default(false),
                    learnings: z
                        .object({
                            scope: z
                                .enum(["local", "global", "auto"])
                                .describe("Learning scope for knowledge base")
                                .default("auto"),
                        })
                        .describe("Learning scope configuration")
                        .default({}),
                    issues: z
                        .object({
                            scope: z
                                .enum(["local", "global", "auto"])
                                .describe("Issue tracking scope for knowledge base")
                                .default("auto"),
                        })
                        .describe("Issue tracking configuration")
                        .default({}),
                    jira: z
                        .object({
                            usage: z
                                .enum(["auto", "enabled", "disabled"])
                                .describe("Jira usage for knowledge base")
                                .default("disabled"),
                            project_keys: z
                                .array(z.string())
                                .describe("Jira project keys for knowledge base")
                                .default([]),
                        })
                        .describe("Jira knowledge base integration")
                        .default({}),
                    linear: z
                        .object({
                            usage: z
                                .enum(["auto", "enabled", "disabled"])
                                .describe("Linear usage for knowledge base")
                                .default("enabled"),
                            team_keys: z
                                .array(z.string())
                                .describe("Linear team keys for knowledge base")
                                .default([]),
                        })
                        .describe("Linear knowledge base integration")
                        .default({}),
                    pull_requests: z
                        .object({
                            scope: z
                                .enum(["local", "global", "auto"])
                                .describe("Pull request scope for knowledge base")
                                .default("auto"),
                        })
                        .describe("Pull request knowledge base settings")
                        .default({}),
                })
                .describe("Knowledge base settings")
                .default({}),
        })
        .describe(
            "CodeRabbit AI review settings. Full schema: https://storage.googleapis.com/coderabbit_public_assets/schema.v2.json",
        )
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

// Export the CodeRabbitConfig type and default
export type CodeRabbitConfig = z.infer<typeof ConfigSchema.shape.coderabbit>;
export const DefaultCodeRabbitConfig: CodeRabbitConfig = ConfigSchema.shape.coderabbit.parse({});
