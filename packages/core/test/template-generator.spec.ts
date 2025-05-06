import { type PathLike, type Stats } from "fs";
import * as fs from "fs/promises";
import * as path from "path";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TemplateGenerator } from "../src/internal/generators/template-generator.js";
import { Config, TeamType } from "../src/internal/schemas/config.js";

// Type helper for asserting private methods
type TemplateGeneratorPrivate = {
    shouldOverwrite: (filePath: string) => Promise<boolean>;
    generateCodeRabbitConfig: () => Promise<void>;
    generateCursorRules: () => Promise<void>;
    writeFile: (relativePath: string, content: string) => Promise<void>;
    processGlobs: (
        glob: string | (string | null | undefined)[] | null | undefined,
    ) => string | null | undefined;
};

vi.mock("fs/promises", async (importOriginal) => {
    const actual = await importOriginal<typeof import("fs/promises")>();
    return {
        ...actual,
        readFile: vi.fn(),
        writeFile: vi.fn(),
        mkdir: vi.fn().mockResolvedValue(undefined),
        stat: vi.fn(),
    };
});

describe("TemplateGenerator", () => {
    let generator: TemplateGenerator;
    const mockConfig: Config = {
        version: "1.0.0",
        teams: [TeamType.enum.offchain, TeamType.enum.solidity, TeamType.enum.ui],
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
    const outputPath = "/mock/output/path";

    beforeEach(() => {
        vi.resetAllMocks();
        generator = new TemplateGenerator(mockConfig, outputPath);
    });

    describe("shouldOverwrite", () => {
        it("returns true if file doesn't exist", async () => {
            vi.mocked(fs.stat).mockRejectedValueOnce(new Error("ENOENT"));

            const shouldOverwrite = await (
                generator as unknown as TemplateGeneratorPrivate
            ).shouldOverwrite("somefile.txt");

            expect(shouldOverwrite).toBe(true);
            expect(fs.stat).toHaveBeenCalledWith(path.join(outputPath, "somefile.txt"));
        });

        it("returns true if the path exists but is not a file", async () => {
            vi.mocked(fs.stat).mockResolvedValueOnce({ isFile: () => false } as Stats);

            const shouldOverwrite = await (
                generator as unknown as TemplateGeneratorPrivate
            ).shouldOverwrite("dir/");

            expect(shouldOverwrite).toBe(true);
        });

        it("checks version for .coderabbit.yaml and returns true if newer", async () => {
            vi.mocked(fs.stat).mockResolvedValueOnce({ isFile: () => true } as Stats);
            vi.mocked(fs.readFile).mockResolvedValueOnce("version: 0.9.0");

            const shouldOverwrite = await (
                generator as unknown as TemplateGeneratorPrivate
            ).shouldOverwrite(".coderabbit.yaml");

            expect(shouldOverwrite).toBe(true);
            expect(fs.readFile).toHaveBeenCalledWith(
                path.join(outputPath, ".coderabbit.yaml"),
                "utf8",
            );
        });

        it("checks version for .coderabbit.yaml and returns false if older or equal", async () => {
            vi.mocked(fs.stat).mockResolvedValueOnce({ isFile: () => true } as Stats);
            vi.mocked(fs.readFile).mockResolvedValueOnce("version: 2.0.0");

            const shouldOverwrite = await (
                generator as unknown as TemplateGeneratorPrivate
            ).shouldOverwrite(".coderabbit.yaml");

            expect(shouldOverwrite).toBe(false);
        });

        it("returns false for .mdc files that aren't managed", async () => {
            vi.mocked(fs.stat).mockResolvedValueOnce({ isFile: () => true } as Stats);

            const shouldOverwrite = await (
                generator as unknown as TemplateGeneratorPrivate
            ).shouldOverwrite(".cursor/rules/Custom/coolkids.mdc");

            expect(shouldOverwrite).toBe(false);
        });

        it("returns true for managed .mdc files with older versions", async () => {
            vi.mocked(fs.stat).mockResolvedValueOnce({ isFile: () => true } as Stats);
            vi.mocked(fs.readFile).mockResolvedValueOnce("version: 0.5.0");

            const shouldOverwrite = await (
                generator as unknown as TemplateGeneratorPrivate
            ).shouldOverwrite(".cursor/rules/Offchain/typescript-base.mdc");

            expect(shouldOverwrite).toBe(true);
        });

        it("returns false for managed .mdc files with newer versions", async () => {
            vi.mocked(fs.stat).mockResolvedValueOnce({ isFile: () => true } as Stats);
            vi.mocked(fs.readFile).mockResolvedValueOnce("version: 2.0.0");

            const shouldOverwrite = await (
                generator as unknown as TemplateGeneratorPrivate
            ).shouldOverwrite(".cursor/rules/Offchain/typescript-base.mdc");

            expect(shouldOverwrite).toBe(false);
        });

        it("returns false if version extraction fails for .mdc files", async () => {
            vi.mocked(fs.stat).mockResolvedValueOnce({ isFile: () => true } as Stats);
            vi.mocked(fs.readFile).mockResolvedValueOnce("invalid content");

            const shouldOverwrite = await (
                generator as unknown as TemplateGeneratorPrivate
            ).shouldOverwrite(".cursor/rules/Offchain/typescript-base.mdc");

            expect(shouldOverwrite).toBe(false);
        });

        it("returns false if reading the file fails", async () => {
            vi.mocked(fs.stat).mockResolvedValueOnce({ isFile: () => true } as Stats);
            vi.mocked(fs.readFile).mockRejectedValueOnce(new Error("Read error"));

            const shouldOverwrite = await (
                generator as unknown as TemplateGeneratorPrivate
            ).shouldOverwrite(".cursor/rules/Offchain/typescript-base.mdc");

            expect(shouldOverwrite).toBe(false);
        });

        it("returns true for .coderabbit.yaml with missing version field", async () => {
            vi.mocked(fs.stat).mockResolvedValueOnce({ isFile: () => true } as Stats);
            vi.mocked(fs.readFile).mockResolvedValueOnce("some: content");

            const shouldOverwrite = await (
                generator as unknown as TemplateGeneratorPrivate
            ).shouldOverwrite(".coderabbit.yaml");

            expect(shouldOverwrite).toBe(true);
        });
    });

    describe("generateAll", () => {
        it("calls generateCodeRabbitConfig and generateCursorRules", async () => {
            const spyGenerateCodeRabbitConfig = vi
                .spyOn(generator as unknown as TemplateGeneratorPrivate, "generateCodeRabbitConfig")
                .mockResolvedValue(undefined);

            const spyGenerateCursorRules = vi
                .spyOn(generator as unknown as TemplateGeneratorPrivate, "generateCursorRules")
                .mockResolvedValue(undefined);

            await generator.generateAll();

            expect(spyGenerateCodeRabbitConfig).toHaveBeenCalledTimes(1);
            expect(spyGenerateCursorRules).toHaveBeenCalledTimes(1);
        });

        it("propagates errors from generateCodeRabbitConfig", async () => {
            const error = new Error("Config generation failed");
            vi.spyOn(
                generator as unknown as TemplateGeneratorPrivate,
                "generateCodeRabbitConfig",
            ).mockRejectedValue(error);
            vi.spyOn(
                generator as unknown as TemplateGeneratorPrivate,
                "generateCursorRules",
            ).mockResolvedValue(undefined);

            await expect(generator.generateAll()).rejects.toThrow(error);
        });

        it("propagates errors from generateCursorRules", async () => {
            const error = new Error("Rules generation failed");
            vi.spyOn(
                generator as unknown as TemplateGeneratorPrivate,
                "generateCodeRabbitConfig",
            ).mockResolvedValue(undefined);
            vi.spyOn(
                generator as unknown as TemplateGeneratorPrivate,
                "generateCursorRules",
            ).mockRejectedValue(error);

            await expect(generator.generateAll()).rejects.toThrow(error);
        });
    });

    describe("generateCodeRabbitConfig", () => {
        it("generates the CodeRabbit config file", async () => {
            vi.mocked(fs.stat).mockRejectedValueOnce(new Error("ENOENT"));
            vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined);

            await (generator as unknown as TemplateGeneratorPrivate).generateCodeRabbitConfig();

            expect(fs.writeFile).toHaveBeenCalledWith(
                path.join(outputPath, ".coderabbit.yaml"),
                expect.any(String),
                "utf8",
            );
        });

        it("skips generation if file exists and has newer version", async () => {
            vi.mocked(fs.stat).mockResolvedValueOnce({ isFile: () => true } as Stats);
            vi.mocked(fs.readFile).mockResolvedValueOnce("version: 2.0.0");

            await (generator as unknown as TemplateGeneratorPrivate).generateCodeRabbitConfig();

            expect(fs.writeFile).not.toHaveBeenCalled();
        });

        it("uses DefaultCodeRabbitConfig when config.coderabbit is undefined", async () => {
            const { coderabbit, ...configWithoutCodeRabbit } = mockConfig;
            const generatorWithoutCodeRabbit = new TemplateGenerator(
                configWithoutCodeRabbit as Config,
                outputPath,
            );

            vi.mocked(fs.stat).mockRejectedValueOnce(new Error("ENOENT"));
            vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined);

            await (
                generatorWithoutCodeRabbit as unknown as TemplateGeneratorPrivate
            ).generateCodeRabbitConfig();

            expect(fs.writeFile).toHaveBeenCalledWith(
                path.join(outputPath, ".coderabbit.yaml"),
                expect.stringContaining("version: 1.0.0"),
                "utf8",
            );
        });
    });

    describe("generateCursorRules", () => {
        it("generates cursor rules for enabled teams", async () => {
            vi.mocked(fs.stat).mockRejectedValue(new Error("ENOENT"));
            vi.mocked(fs.mkdir).mockResolvedValue(undefined);
            vi.mocked(fs.writeFile).mockResolvedValue(undefined);

            await (generator as unknown as TemplateGeneratorPrivate).generateCursorRules();

            expect(fs.writeFile).toHaveBeenCalledTimes(13);

            expect(fs.writeFile).toHaveBeenCalledWith(
                path.join(outputPath, ".cursor/rules/Offchain/typescript-base.mdc"),
                expect.stringContaining("Base TypeScript development guidelines"),
                "utf8",
            );

            expect(fs.writeFile).toHaveBeenCalledWith(
                path.join(outputPath, ".cursor/rules/Solidity/solidity-base.mdc"),
                expect.stringContaining("Solidity guidelines"),
                "utf8",
            );

            expect(fs.writeFile).toHaveBeenCalledWith(
                path.join(outputPath, ".cursor/rules/UI/react-components.mdc"),
                expect.stringContaining("React component development guidelines"),
                "utf8",
            );
        });

        it("skips rules for disabled teams", async () => {
            const limitedConfig = {
                ...mockConfig,
                teams: [TeamType.enum.offchain],
            };
            const limitedGenerator = new TemplateGenerator(limitedConfig, outputPath);

            vi.mocked(fs.stat).mockRejectedValue(new Error("ENOENT"));
            vi.mocked(fs.mkdir).mockResolvedValue(undefined);
            vi.mocked(fs.writeFile).mockResolvedValue(undefined);

            await (limitedGenerator as unknown as TemplateGeneratorPrivate).generateCursorRules();

            expect(fs.writeFile).toHaveBeenCalledWith(
                expect.stringMatching(/Offchain/),
                expect.any(String),
                "utf8",
            );

            expect(fs.writeFile).not.toHaveBeenCalledWith(
                expect.stringMatching(/Solidity/),
                expect.any(String),
                "utf8",
            );

            expect(fs.writeFile).not.toHaveBeenCalledWith(
                expect.stringMatching(/UI/),
                expect.any(String),
                "utf8",
            );
        });

        it("skips generating rules that shouldn't be overwritten", async () => {
            vi.mocked(fs.stat).mockImplementation(async (p: PathLike) => {
                if (String(p).includes("typescript-base.mdc")) {
                    return { isFile: () => true } as Stats;
                }
                throw new Error("ENOENT");
            });

            vi.mocked(fs.readFile).mockImplementation(async (p: PathLike | fs.FileHandle) => {
                if (String(p as string).includes("typescript-base.mdc")) {
                    return "version: 2.0.0";
                }
                return "";
            });

            vi.mocked(fs.mkdir).mockResolvedValue(undefined);
            vi.mocked(fs.writeFile).mockResolvedValue(undefined);

            await (generator as unknown as TemplateGeneratorPrivate).generateCursorRules();

            expect(fs.writeFile).not.toHaveBeenCalledWith(
                expect.stringMatching(/typescript-base\.mdc$/),
                expect.any(String),
                "utf8",
            );

            expect(fs.writeFile).toHaveBeenCalled();
        });

        it("throws if any write operation fails", async () => {
            vi.mocked(fs.stat).mockRejectedValue(new Error("ENOENT"));
            vi.mocked(fs.mkdir).mockResolvedValue(undefined);

            vi.mocked(fs.writeFile).mockImplementation(async (p: PathLike | fs.FileHandle) => {
                if (String(p as string).includes("typescript-base.mdc")) {
                    throw new Error("Test error");
                }
                return undefined;
            });

            await expect(
                (generator as unknown as TemplateGeneratorPrivate).generateCursorRules(),
            ).rejects.toThrow("Test error");
        });

        it("handles array globs in rule definitions", async () => {
            vi.mocked(fs.mkdir).mockResolvedValue(undefined);
            vi.mocked(fs.writeFile).mockResolvedValue(undefined);
            vi.mocked(fs.stat).mockRejectedValue(new Error("ENOENT"));

            const originalGenerateCursorRules = (generator as unknown as TemplateGeneratorPrivate)
                .generateCursorRules;
            (generator as unknown as TemplateGeneratorPrivate).generateCursorRules =
                async function (this: TemplateGeneratorPrivate) {
                    const stringGlobs = "*.ts";
                    const arrayGlobs = ["*.ts", "*.tsx"];

                    let content1 = `globs: ${Array.isArray(stringGlobs) ? stringGlobs.join(", ") : stringGlobs}`;
                    await this.writeFile("test-string-globs.txt", content1);

                    let content2 = `globs: ${Array.isArray(arrayGlobs) ? arrayGlobs.join(", ") : arrayGlobs}`;
                    await this.writeFile("test-array-globs.txt", content2);
                };

            try {
                await (generator as unknown as TemplateGeneratorPrivate).generateCursorRules();

                expect(fs.writeFile).toHaveBeenCalledWith(
                    path.join(outputPath, "test-string-globs.txt"),
                    "globs: *.ts",
                    "utf8",
                );

                expect(fs.writeFile).toHaveBeenCalledWith(
                    path.join(outputPath, "test-array-globs.txt"),
                    "globs: *.ts, *.tsx",
                    "utf8",
                );
            } finally {
                (generator as unknown as TemplateGeneratorPrivate).generateCursorRules =
                    originalGenerateCursorRules;
            }
        });

        it("handles null or undefined globs in rule definitions", async () => {
            vi.mocked(fs.mkdir).mockResolvedValue(undefined);
            vi.mocked(fs.writeFile).mockResolvedValue(undefined);
            vi.mocked(fs.stat).mockRejectedValue(new Error("ENOENT"));

            const originalGenerateCursorRules = (generator as unknown as TemplateGeneratorPrivate)
                .generateCursorRules;
            (generator as unknown as TemplateGeneratorPrivate).generateCursorRules =
                async function (this: TemplateGeneratorPrivate) {
                    const undefinedGlobs = undefined;

                    let content = `globs: ${Array.isArray(undefinedGlobs) ? (undefinedGlobs as string[]).join(", ") : undefinedGlobs}`;
                    await this.writeFile("test-undefined-globs.txt", content);
                };

            try {
                await (generator as unknown as TemplateGeneratorPrivate).generateCursorRules();

                expect(fs.writeFile).toHaveBeenCalledWith(
                    path.join(outputPath, "test-undefined-globs.txt"),
                    "globs: undefined",
                    "utf8",
                );
            } finally {
                (generator as unknown as TemplateGeneratorPrivate).generateCursorRules =
                    originalGenerateCursorRules;
            }
        });

        it("checks an array with empty elements for rule globs", async () => {
            const mockRuleWithEmptyArrayElements = {
                name: "test-rule-with-empty-globs",
                description: "Test rule with array globs containing empty elements",
                globs: ["*.ts", "", null, undefined, "*.tsx"],
                content: "Test rule content for empty array elements",
            };

            vi.mocked(fs.mkdir).mockResolvedValue(undefined);
            vi.mocked(fs.writeFile).mockResolvedValue(undefined);
            vi.mocked(fs.stat).mockRejectedValue(new Error("ENOENT"));

            const isEmptyCheckSpy = vi.fn(
                (
                    glob: string | (string | null | undefined)[] | null | undefined,
                ): string | null | undefined => {
                    if (Array.isArray(glob)) {
                        return (
                            glob
                                .filter((g): g is string => typeof g === "string" && g.length > 0)
                                .join(", ") || null
                        );
                    }
                    return typeof glob === "string" ? glob : null;
                },
            );

            (generator as unknown as TemplateGeneratorPrivate).processGlobs = isEmptyCheckSpy;

            const result = (generator as unknown as TemplateGeneratorPrivate).processGlobs(
                mockRuleWithEmptyArrayElements.globs,
            );

            expect(result).toBe("*.ts, *.tsx");
            expect(isEmptyCheckSpy).toHaveBeenCalled();
            expect(isEmptyCheckSpy).toHaveBeenCalledWith(mockRuleWithEmptyArrayElements.globs);
        });
    });

    describe("writeFile", () => {
        it("creates directories and writes content", async () => {
            const relativePath = "some/nested/dir/file.txt";
            const content = "file content";

            await (generator as unknown as TemplateGeneratorPrivate).writeFile(
                relativePath,
                content,
            );

            expect(fs.mkdir).toHaveBeenCalledWith(path.join(outputPath, "some/nested/dir"), {
                recursive: true,
            });

            expect(fs.writeFile).toHaveBeenCalledWith(
                path.join(outputPath, relativePath),
                content,
                "utf8",
            );
        });

        it("propagates errors from mkdir", async () => {
            const error = new Error("mkdir failed");
            vi.mocked(fs.mkdir).mockRejectedValueOnce(error);

            await expect(
                (generator as unknown as TemplateGeneratorPrivate).writeFile("test.txt", "content"),
            ).rejects.toThrow(error);

            expect(fs.writeFile).not.toHaveBeenCalled();
        });

        it("propagates errors from writeFile", async () => {
            const error = new Error("writeFile failed");
            vi.mocked(fs.mkdir).mockResolvedValueOnce(undefined);
            vi.mocked(fs.writeFile).mockRejectedValueOnce(error);

            await expect(
                (generator as unknown as TemplateGeneratorPrivate).writeFile("test.txt", "content"),
            ).rejects.toThrow(error);
        });
    });
});
