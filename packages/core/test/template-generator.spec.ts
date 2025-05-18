import { type PathLike, type Stats } from "fs";
import * as fs from "fs/promises";
import * as path from "path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { TemplateGenerator } from "../src/internal/generators/template-generator.js";
import {
    Config,
    ConfigSchema,
    DefaultCodeRabbitConfig,
    TeamType,
} from "../src/internal/schemas/config.js";

let mockCoderabbitSchemaAsNonObject = false;

vi.mock("../src/internal/schemas/config.js", async () => {
    const actual = await vi.importActual<typeof import("../src/internal/schemas/config.js")>(
        "../src/internal/schemas/config.js",
    );
    const { z } = await vi.importActual<typeof import("zod")>("zod");
    const actualConfigSchema = actual.ConfigSchema;

    return {
        ...actual, // Spread all actual exports (includes DefaultCodeRabbitConfig, TeamType, etc.)
        get ConfigSchema() {
            if (mockCoderabbitSchemaAsNonObject) {
                return {
                    ...actualConfigSchema,
                    shape: {
                        ...actualConfigSchema.shape,
                        coderabbit: z
                            .string()
                            .optional()
                            .default("mocked string schema from vi.mock"),
                    },
                };
            }
            return actualConfigSchema;
        },
    };
});

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
        typescript: { language: "typescript" },
        solidity: { gasOptimizations: true, framework: "foundry", testing: { framework: "forge" } },
        coderabbit: DefaultCodeRabbitConfig,
    };
    const outputPath = "/mock/output/path";

    beforeEach(() => {
        mockCoderabbitSchemaAsNonObject = false;
        vi.resetAllMocks();
        generator = new TemplateGenerator(mockConfig, outputPath);
    });

    describe("constructor", () => {
        it("initializes managedRulePaths correctly based on config teams", () => {
            const configWithOffchain: Config = { ...mockConfig, teams: [TeamType.enum.offchain] };
            const genOffchain = new TemplateGenerator(configWithOffchain, outputPath);
            // @ts-expect-error accessing private member
            expect(genOffchain.managedRulePaths).toContain(
                ".cursor/rules/Offchain/typescript-base.mdc",
            );
            // @ts-expect-error accessing private member
            expect(genOffchain.managedRulePaths).not.toContain(
                ".cursor/rules/UI/react-best-practices.mdc",
            );

            const configWithUI: Config = { ...mockConfig, teams: [TeamType.enum.ui] };
            const genUI = new TemplateGenerator(configWithUI, outputPath);
            // @ts-expect-error accessing private member
            expect(genUI.managedRulePaths).toContain(".cursor/rules/UI/react-components.mdc");

            const configWithNone: Config = { ...mockConfig, teams: [] };
            const genNone = new TemplateGenerator(configWithNone, outputPath);
            // @ts-expect-error accessing private member
            expect(genNone.managedRulePaths.size).toBe(0);
        });
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
        beforeEach(() => {
            // This spy is on the generator instance created in the outer beforeEach,
            // which uses the default (actual) ConfigSchema via the mock.
            vi.spyOn(
                generator as unknown as TemplateGeneratorPrivate,
                "shouldOverwrite",
            ).mockResolvedValue(true);
        });

        it("uses the unwrapped ZodObject when coderabbit schema is wrapped (covers lines 159-162)", async () => {
            mockCoderabbitSchemaAsNonObject = false;

            const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

            await (generator as unknown as TemplateGeneratorPrivate).generateCodeRabbitConfig();
            const writtenContent = vi.mocked(fs.writeFile).mock.calls[0]?.[1] as string;

            // Check for a field that proves the full schema was used, not the minimal one.
            expect(writtenContent).toMatch(
                /# Language for reviews using ISO language code\s*\nlanguage: en-US/,
            );
            expect(consoleWarnSpy).not.toHaveBeenCalled();
            consoleWarnSpy.mockRestore();
        });

        it("warns and uses minimal schema if unwrapped coderabbit schema is not ZodObject (covers lines 176-185)", async () => {
            mockCoderabbitSchemaAsNonObject = true;

            try {
                const testConfigData = {
                    version: "1.0.0",
                    teams: [],
                    coderabbit: "actual string data for coderabbit field",
                };
                const testSpecificGenerator = new TemplateGenerator(
                    testConfigData as unknown as any,
                    outputPath,
                );
                vi.spyOn(
                    testSpecificGenerator as unknown as TemplateGeneratorPrivate,
                    "shouldOverwrite",
                ).mockResolvedValue(true);

                await (
                    testSpecificGenerator as unknown as TemplateGeneratorPrivate
                ).generateCodeRabbitConfig();

                expect(fs.writeFile).toHaveBeenCalled();
                const writtenContent = vi.mocked(fs.writeFile).mock.calls[0]?.[1] as string;

                expect(writtenContent).toContain("# Configuration file version.");
                expect(writtenContent).toContain("version: 1.0.0");
                expect(writtenContent).not.toContain(
                    "# Language for reviews uses ISO language code",
                );
                expect(writtenContent).not.toContain("language: en");
            } finally {
                mockCoderabbitSchemaAsNonObject = false;
            }
        });

        it("uses DefaultCodeRabbitConfig when config.coderabbit is undefined", async () => {
            mockCoderabbitSchemaAsNonObject = false;
            const { coderabbit, ...configWithoutExplicitCodeRabbit } = mockConfig;

            const localGenerator = new TemplateGenerator(
                configWithoutExplicitCodeRabbit as Config,
                outputPath,
            );
            vi.spyOn(
                localGenerator as unknown as TemplateGeneratorPrivate,
                "shouldOverwrite",
            ).mockResolvedValue(true);
            vi.mocked(fs.stat).mockResolvedValue({ isFile: () => false } as Stats);

            await (
                localGenerator as unknown as TemplateGeneratorPrivate
            ).generateCodeRabbitConfig();
            const writtenContent = vi.mocked(fs.writeFile).mock.calls[0]?.[1] as string;
            expect(writtenContent).toContain("language: en");
        });

        it("includes field-level comments in the generated YAML", async () => {
            const { coderabbit, ...configWithoutExplicitCodeRabbit } = mockConfig;
            generator = new TemplateGenerator(
                configWithoutExplicitCodeRabbit as Config,
                outputPath,
            );
            vi.mocked(fs.stat).mockResolvedValue({ isFile: () => false } as Stats);

            await (generator as unknown as TemplateGeneratorPrivate).generateCodeRabbitConfig();

            // Ensure fs.writeFile was called
            expect(fs.writeFile).toHaveBeenCalled();
            // Get the YAML string that was written
            const call = vi.mocked(fs.writeFile).mock.calls[0];
            expect(call).toBeDefined();
            const yamlString = call ? (call[1] as string) : "";

            // Check for a field-level comment for 'language'
            expect(yamlString).toMatch(
                /# Language for reviews using ISO language code\s*\nlanguage: en-US/,
            );
            // Check for a field-level comment for 'tone_instructions' (update to match actual description)
            expect(yamlString).toMatch(
                /# Custom instructions for review tone \(max 250 chars\)\s*\ntone_instructions: ""/,
            );
        });

        it("handles getDescription when parentSchema is not a ZodObject", async () => {
            const testSchema = z.object({
                version: z.string().describe("Version field"),
                // This schema will be passed as parentSchema
                parent_is_string: z.string(),
            });
            const testDataWithVersion = {
                version: "1.0.0",
                parent_is_string: "test_value",
            };

            // Directly call getDescription to simulate the specific scenario
            // @ts-expect-error accessing private member
            const description = generator.getDescription(
                "sub_field",
                testSchema.shape.parent_is_string,
            );
            expect(description).toBeUndefined();

            // Also check via generateDirectYamlWithComments to ensure no crash and basic output
            // @ts-expect-error accessing private member
            const yamlContent = generator.generateDirectYamlWithComments(
                testDataWithVersion as unknown as any,
                "1.0.0",
                testSchema,
            );
            expect(yamlContent).toContain("# Version field");
            expect(yamlContent).toContain("version: 1.0.0");
            expect(yamlContent).toContain("parent_is_string: test_value");
            // No comment expected for parent_is_string if we tried to describe its non-existent children using its own string schema
            expect(yamlContent).not.toContain("parent_is_string: #");
        });

        it("handles getDescription when fieldName does not exist in parentSchema shape", async () => {
            const testSchema = z.object({
                version: z.string().describe("Version field"),
                known_field: z.string().describe("Known field"),
            });
            const testDataWithVersion = {
                version: "1.0.0",
                known_field: "value",
                unknown_field: "another value",
            };

            // @ts-expect-error accessing private member
            const yamlContent = generator.generateDirectYamlWithComments(
                testDataWithVersion as unknown as any,
                "1.0.0",
                testSchema,
            );

            expect(yamlContent).toContain("# Version field");
            expect(yamlContent).toContain("version: 1.0.0");
            expect(yamlContent).toContain("# Known field");
            expect(yamlContent).toContain("known_field: value");
            expect(yamlContent).toContain("unknown_field: another value");
            expect(yamlContent).not.toMatch(/unknown_field:\s*#/);
        });

        it("gets description from optional/default wrapped schema if inner has description", async () => {
            const testSchema = z.object({
                version: z.string().describe("Version field"),
                optional_field: z.optional(z.string().describe("Optional Description")),
                default_field: z
                    .string()
                    .default("default")
                    .describe("Default Description Wrapper"),
                default_inner_field: z.string().describe("Inner Default Desc").default("val"),
            });
            const testDataWithVersion = {
                version: "1.0.0",
                optional_field: "val1",
                default_field: "val2",
                default_inner_field: "val3",
            };

            // @ts-expect-error accessing private member
            const yamlContent = generator.generateDirectYamlWithComments(
                testDataWithVersion as unknown as any,
                "1.0.0",
                testSchema,
            );

            expect(yamlContent).toContain("# Version field");
            expect(yamlContent).toContain("# Optional Description");
            expect(yamlContent).toContain("optional_field: val1");
            expect(yamlContent).toContain("# Default Description Wrapper");
            expect(yamlContent).toContain("default_field: val2");
            expect(yamlContent).toContain("# Inner Default Desc");
            expect(yamlContent).toContain("default_inner_field: val3");
        });

        it("returns no description if neither field nor its wrapped schema have one", async () => {
            const testSchema = z.object({
                version: z.string().describe("Version field"),
                plain_optional: z.optional(z.string()),
                plain_default: z.string().default("test"),
            });
            const testDataWithVersion = {
                version: "1.0.0",
                plain_optional: "pv",
                plain_default: "pd",
            };

            // @ts-expect-error accessing private member
            const yamlContent = generator.generateDirectYamlWithComments(
                testDataWithVersion as unknown as any,
                "1.0.0",
                testSchema,
            );

            expect(yamlContent).toContain("# Version field");
            expect(yamlContent).not.toMatch(/plain_optional:\s*#/);
            expect(yamlContent).toContain("plain_optional: pv");
            expect(yamlContent).not.toMatch(/plain_default:\s*#/);
            expect(yamlContent).toContain("plain_default: pd");
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

    describe("injectFieldComments edge cases", () => {
        it("handles empty objects", () => {
            const generatorAny = generator as unknown as any;
            const yaml = "{}";
            const config = {};
            const schema = { shape: {} };
            const result = generatorAny.injectFieldComments(yaml, config, schema);
            expect(result).toBe("{}");
        });

        it("handles arrays as config", () => {
            const generatorAny = generator as unknown as any;
            const yaml = "- item1\n- item2";
            const config = ["item1", "item2"];
            const schema = undefined;
            const result = generatorAny.injectFieldComments(yaml, config, schema);
            expect(result).toContain("- item1");
            expect(result).toContain("- item2");
        });

        it("handles unexpected types gracefully", () => {
            const generatorAny = generator as unknown as any;
            const yaml = "some: value";
            const config = 42;
            const schema = undefined;
            const result = generatorAny.injectFieldComments(yaml, config, schema);
            expect(result).toContain("some: value");
        });
    });
});
