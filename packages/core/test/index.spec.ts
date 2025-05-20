import { type PathLike, type Stats } from "fs";
import * as fsPromises from "fs/promises";
import * as path from "path";
import type { MockedFunction, MockInstance } from "vitest";
import inquirer from "inquirer";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { run } from "../src/index.js";
import { TemplateGenerator } from "../src/internal/generators/template-generator.js";

vi.mock("inquirer", () => ({
    default: {
        prompt: vi.fn(),
    },
}));

vi.mock("fs/promises", async (importOriginal) => {
    const actual = await importOriginal<typeof import("fs/promises")>();
    return {
        ...actual,
        access: vi.fn(),
        mkdir: vi.fn(),
        writeFile: vi.fn(),
        readFile: vi.fn(),
        stat: vi.fn(),
    };
});

vi.mock("../src/internal/generators/template-generator.js");

describe("Core Script (run function)", () => {
    let mockInquirerPrompt: MockedFunction<typeof inquirer.prompt>;
    let mockFsAccess: MockedFunction<typeof fsPromises.access>;
    let mockFsStat: MockedFunction<typeof fsPromises.stat>;
    let mockFsReadFile: MockedFunction<typeof fsPromises.readFile>;

    let spyProcessExit: MockInstance<any>;
    let spyProcessCwd: MockInstance<any>;
    let spyConsoleLog: MockInstance<any>;
    let spyConsoleError: MockInstance<any>;
    let spyConsoleWarn: MockInstance<any>;

    let mockGenerateAll: MockedFunction<() => Promise<void>>;

    beforeAll(async () => {
        mockInquirerPrompt = vi.mocked(inquirer.prompt);

        const fsPromisesImport = await import("fs/promises");
        mockFsAccess = vi.mocked(fsPromisesImport.access);
        mockFsStat = vi.mocked(fsPromisesImport.stat);
        mockFsReadFile = vi.mocked(fsPromisesImport.readFile);
    });

    beforeEach(() => {
        vi.resetAllMocks();

        mockGenerateAll = vi.fn().mockResolvedValue(undefined);
        vi.mocked(TemplateGenerator).mockImplementation(
            () =>
                ({
                    generateAll: mockGenerateAll,
                }) as unknown as TemplateGenerator,
        );

        spyProcessExit = vi.spyOn(process, "exit").mockImplementation((_code?: number) => {
            throw new Error(`process.exit called with ${_code ?? "no code"}`);
        });
        spyProcessCwd = vi.spyOn(process, "cwd").mockReturnValue("/fake/project/dir");
        spyConsoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
        spyConsoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        spyConsoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

        mockInquirerPrompt.mockResolvedValue({ confirm: true } as unknown as any);
        mockFsAccess.mockRejectedValue(new Error("ENOENT"));

        mockFsStat.mockImplementation(async (p: PathLike) => {
            if (String(p).endsWith("package.json")) {
                return { isFile: () => true } as Stats;
            }
            throw new Error("ENOENT");
        });

        mockFsReadFile.mockImplementation(async (p: PathLike | fsPromises.FileHandle) => {
            if (String(p).endsWith("package.json")) {
                return JSON.stringify({ workspaces: ["packages/*"] });
            }
            return "";
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("runs successfully, checks for files, and calls generator when no existing config is found", async () => {
        await run();

        expect(spyConsoleLog).toHaveBeenCalledWith("Starting AI Rules installation...");
        expect(mockFsAccess).toHaveBeenCalledWith(
            path.join("/fake/project/dir", ".coderabbit.yaml"),
        );
        expect(mockFsAccess).toHaveBeenCalledWith(path.join("/fake/project/dir", ".cursor"));
        expect(mockInquirerPrompt).not.toHaveBeenCalled();
        expect(TemplateGenerator).toHaveBeenCalledTimes(1);
        expect(mockGenerateAll).toHaveBeenCalledTimes(1);
        expect(mockGenerateAll).toHaveBeenCalledWith();
        expect(spyConsoleLog).toHaveBeenCalledWith(
            "✅ AI Rules configuration files generated successfully!",
        );
        expect(spyProcessExit).not.toHaveBeenCalled();
    });

    it("prompts for confirmation if .coderabbit.yaml exists", async () => {
        mockFsAccess.mockImplementation(async (p: PathLike) => {
            if (String(p).endsWith(".coderabbit.yaml")) return;
            throw new Error("ENOENT");
        });

        await run();

        expect(mockFsAccess).toHaveBeenCalledWith("/fake/project/dir/.coderabbit.yaml");
        expect(mockInquirerPrompt).toHaveBeenCalledTimes(1);
        expect(mockInquirerPrompt).toHaveBeenCalledWith([
            expect.objectContaining({ name: "confirm" }),
        ]);
        expect(TemplateGenerator).toHaveBeenCalledTimes(1);
        expect(mockGenerateAll).toHaveBeenCalledTimes(1);
        expect(spyConsoleLog).toHaveBeenCalledWith(
            "✅ AI Rules configuration files generated successfully!",
        );
        expect(spyProcessExit).not.toHaveBeenCalled();
    });

    it("prompts for confirmation if .cursor directory exists", async () => {
        mockFsAccess.mockImplementation(async (p: PathLike) => {
            if (String(p).endsWith(".cursor")) return;
            throw new Error("ENOENT");
        });

        await run();

        expect(mockFsAccess).toHaveBeenCalledWith("/fake/project/dir/.cursor");
        expect(mockInquirerPrompt).toHaveBeenCalledTimes(1);
        expect(TemplateGenerator).toHaveBeenCalledTimes(1);
        expect(mockGenerateAll).toHaveBeenCalledTimes(1);
        expect(spyConsoleLog).toHaveBeenCalledWith(
            "✅ AI Rules configuration files generated successfully!",
        );
        expect(spyProcessExit).not.toHaveBeenCalled();
    });

    it("cancels installation if user denies overwrite confirmation", async () => {
        mockFsAccess.mockResolvedValue(undefined);
        mockInquirerPrompt.mockResolvedValue({ confirm: false });

        await run();

        expect(mockInquirerPrompt).toHaveBeenCalledTimes(1);
        expect(spyConsoleLog).toHaveBeenCalledWith("Installation cancelled.");
        expect(TemplateGenerator).not.toHaveBeenCalled();
        expect(mockGenerateAll).not.toHaveBeenCalled();
        expect(spyProcessExit).not.toHaveBeenCalled();
    });

    it("handles error during generation and exits with code 1", async () => {
        const generationError = new Error("Failed to generate");
        mockGenerateAll.mockRejectedValue(generationError);

        await expect(run()).rejects.toThrow("process.exit called with 1");

        expect(TemplateGenerator).toHaveBeenCalledTimes(1);
        expect(mockGenerateAll).toHaveBeenCalledTimes(1);
        expect(spyConsoleError).toHaveBeenCalledWith("❌ Error during AI Rules installation:");
        expect(spyConsoleError).toHaveBeenCalledWith(generationError.message);
        expect(spyProcessExit).toHaveBeenCalledWith(1);
    });

    it("handles error during confirmation prompt and proceeds", async () => {
        mockFsAccess.mockResolvedValue(undefined);
        const promptError = new Error("Inquirer failed");
        mockInquirerPrompt.mockRejectedValue(promptError);

        await run();

        expect(spyConsoleWarn).toHaveBeenCalledWith(
            "Could not load or run inquirer, proceeding without confirmation.",
        );
        expect(spyConsoleWarn).toHaveBeenCalledWith(promptError.message);
        expect(TemplateGenerator).toHaveBeenCalledTimes(1);
        expect(mockGenerateAll).toHaveBeenCalledTimes(1);
        expect(spyConsoleLog).toHaveBeenCalledWith(
            "✅ AI Rules configuration files generated successfully!",
        );
        expect(spyProcessExit).not.toHaveBeenCalled();
    });

    it("handles non-ENOENT error during fs.access check and proceeds without prompt", async () => {
        const accessError = new Error("Permission denied");
        (accessError as unknown as any).code = "EACCES";
        mockFsAccess.mockRejectedValue(accessError);

        await run();

        expect(spyConsoleError).toHaveBeenCalledWith(
            expect.stringContaining("File check failed for:"),
        );
        expect(mockInquirerPrompt).not.toHaveBeenCalled();
        expect(TemplateGenerator).toHaveBeenCalledTimes(1);
        expect(mockGenerateAll).toHaveBeenCalledTimes(1);
        expect(spyConsoleLog).toHaveBeenCalledWith(
            "✅ AI Rules configuration files generated successfully!",
        );
        expect(spyProcessExit).not.toHaveBeenCalled();
    });

    it("process.exit behavior remains consistent", () => {
        expect(() => {
            spyProcessExit.getMockImplementation()?.(undefined);
        }).toThrow("process.exit called with no code");
        expect(() => {
            spyProcessExit.getMockImplementation()?.(1);
        }).toThrow("process.exit called with 1");
    });

    it("handles ProjectRootNotFound error and exits with code 1", async () => {
        // Mock file system to simulate no package.json with workspaces
        mockFsStat.mockRejectedValue(new Error("ENOENT"));

        await expect(run()).rejects.toThrow("process.exit called with 1");

        expect(spyConsoleError).toHaveBeenCalledWith("❌ Error during AI Rules installation:");
        expect(spyConsoleError).toHaveBeenCalledWith(
            "Could not find project root. Looked for pnpm-workspace.yaml, package.json with 'workspaces', or package.json with 'name'.",
        );
        expect(spyProcessExit).toHaveBeenCalledWith(1);
    });
});

// Helper function to simulate fs.stat responses for findRootDir tests
const mockFsStatImplementation = (existingFiles: Record<string, "file" | "dir">) => {
    return async (p: PathLike): Promise<Stats> => {
        const filePath = path.normalize(String(p));
        if (existingFiles[filePath]) {
            return {
                isFile: () => existingFiles[filePath] === "file",
                isDirectory: () => existingFiles[filePath] === "dir",
            } as Stats;
        }
        const error = new Error(`ENOENT: no such file or directory, stat '${filePath}'`);
        (error as unknown as any).code = "ENOENT";
        throw error;
    };
};

// Helper function to simulate fs.readFile responses for findRootDir tests
const mockFsReadFileImplementation = (fileContents: Record<string, string>) => {
    return async (p: PathLike | fsPromises.FileHandle, options?: any): Promise<string> => {
        const filePath = path.normalize(String(p));
        if (fileContents[filePath]) {
            return fileContents[filePath];
        }
        const error = new Error(`ENOENT: no such file or directory, open '${filePath}'`);
        (error as unknown as any).code = "ENOENT";
        throw error;
    };
};

describe("findRootDir", () => {
    let spyProcessCwd: MockInstance<any>;
    let mockFsStat: MockedFunction<typeof fsPromises.stat>;
    let mockFsReadFile: MockedFunction<typeof fsPromises.readFile>;

    let findRootDirFunction: () => Promise<string>;

    beforeEach(async () => {
        vi.resetModules();
        spyProcessCwd = vi.spyOn(process, "cwd").mockReturnValue("/project/packages/module-a");

        vi.mocked(fsPromises.stat).mockReset();
        vi.mocked(fsPromises.readFile).mockReset();

        mockFsStat = vi.mocked(fsPromises.stat);
        mockFsReadFile = vi.mocked(fsPromises.readFile);

        const indexModule = await import("../src/index.js");
        findRootDirFunction = indexModule.findRootDir;
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.resetModules();
    });

    it("finds root with pnpm-workspace.yaml in current directory", async () => {
        spyProcessCwd.mockReturnValue("/project");
        mockFsStat.mockImplementation(
            mockFsStatImplementation({
                "/project/pnpm-workspace.yaml": "file",
            }),
        );
        await expect(findRootDirFunction()).resolves.toBe("/project");
    });

    it("finds root with pnpm-workspace.yaml in parent directory", async () => {
        spyProcessCwd.mockReturnValue("/project/packages/module-a");
        mockFsStat.mockImplementation(
            mockFsStatImplementation({
                "/project/pnpm-workspace.yaml": "file",
                "/project/packages/module-a/package.json": "file",
            }),
        );
        mockFsReadFile.mockImplementation(
            mockFsReadFileImplementation({
                "/project/packages/module-a/package.json": JSON.stringify({ name: "module-a" }),
            }),
        );
        await expect(findRootDirFunction()).resolves.toBe("/project");
    });

    it("finds root with package.json (workspaces) in current directory", async () => {
        spyProcessCwd.mockReturnValue("/project");
        mockFsStat.mockImplementation(
            mockFsStatImplementation({
                "/project/package.json": "file",
            }),
        );
        mockFsReadFile.mockImplementation(
            mockFsReadFileImplementation({
                "/project/package.json": JSON.stringify({ workspaces: ["packages/*"] }),
            }),
        );
        await expect(findRootDirFunction()).resolves.toBe("/project");
    });

    it("finds root with package.json (workspaces) in parent directory", async () => {
        spyProcessCwd.mockReturnValue("/project/packages/module-a");
        mockFsStat.mockImplementation(
            mockFsStatImplementation({
                "/project/package.json": "file",
                "/project/packages/module-a/package.json": "file",
            }),
        );
        mockFsReadFile.mockImplementation(
            mockFsReadFileImplementation({
                "/project/package.json": JSON.stringify({ workspaces: ["packages/*"] }),
                "/project/packages/module-a/package.json": JSON.stringify({ name: "module-a" }),
            }),
        );
        await expect(findRootDirFunction()).resolves.toBe("/project");
    });

    it("finds root with package.json (name) as fallback in current directory", async () => {
        spyProcessCwd.mockReturnValue("/project");
        mockFsStat.mockImplementation(
            mockFsStatImplementation({
                "/project/package.json": "file",
            }),
        );
        mockFsReadFile.mockImplementation(
            mockFsReadFileImplementation({
                "/project/package.json": JSON.stringify({ name: "my-project" }),
            }),
        );
        await expect(findRootDirFunction()).resolves.toBe("/project");
    });

    it("finds root with package.json (name) as fallback in parent, preferring closest to cwd", async () => {
        spyProcessCwd.mockReturnValue("/project/packages/module-a");
        mockFsStat.mockImplementation(
            mockFsStatImplementation({
                "/project/packages/package.json": "file",
                "/project/package.json": "file",
            }),
        );
        mockFsReadFile.mockImplementation(
            mockFsReadFileImplementation({
                "/project/packages/package.json": JSON.stringify({
                    name: "packages-level-project",
                }),
                "/project/package.json": JSON.stringify({ name: "root-level-project" }),
            }),
        );
        await expect(findRootDirFunction()).resolves.toBe("/project/packages");
    });

    it("pnpm-workspace.yaml takes precedence over package.json with workspaces in same dir", async () => {
        spyProcessCwd.mockReturnValue("/project");
        mockFsStat.mockImplementation(
            mockFsStatImplementation({
                "/project/pnpm-workspace.yaml": "file",
                "/project/package.json": "file",
            }),
        );
        mockFsReadFile.mockImplementation(
            mockFsReadFileImplementation({
                "/project/package.json": JSON.stringify({ workspaces: ["packages/*"] }),
            }),
        );
        await expect(findRootDirFunction()).resolves.toBe("/project");
    });

    it("package.json with workspaces takes precedence over package.json with name in same dir", async () => {
        spyProcessCwd.mockReturnValue("/project");
        mockFsStat.mockImplementation(
            mockFsStatImplementation({
                "/project/package.json": "file",
            }),
        );
        mockFsReadFile.mockImplementation(
            mockFsReadFileImplementation({
                "/project/package.json": JSON.stringify({
                    name: "my-project",
                    workspaces: ["packages/*"],
                }),
            }),
        );
        await expect(findRootDirFunction()).resolves.toBe("/project");
    });

    it("throws ProjectRootNotFound if no indicators are found up to filesystem root", async () => {
        spyProcessCwd.mockReturnValue("/some/deep/path");
        mockFsStat.mockImplementation(mockFsStatImplementation({}));
        mockFsReadFile.mockImplementation(mockFsReadFileImplementation({}));

        await expect(findRootDirFunction()).rejects.toThrow(
            "Could not find project root. Looked for pnpm-workspace.yaml, package.json with 'workspaces', or package.json with 'name'.",
        );
    });

    it("ignores malformed package.json and continues search", async () => {
        spyProcessCwd.mockReturnValue("/project/packages/module-a");
        mockFsStat.mockImplementation(
            mockFsStatImplementation({
                "/project/packages/module-a/package.json": "file",
                "/project/package.json": "file",
            }),
        );
        mockFsReadFile.mockImplementation(
            mockFsReadFileImplementation({
                "/project/packages/module-a/package.json": "{ malformed json",
                "/project/package.json": JSON.stringify({ name: "root-project" }),
            }),
        );
        await expect(findRootDirFunction()).resolves.toBe("/project");
    });

    it("ignores pnpm-workspace.yaml if it is a directory", async () => {
        spyProcessCwd.mockReturnValue("/project/module-a");
        mockFsStat.mockImplementation(
            mockFsStatImplementation({
                "/project/module-a/pnpm-workspace.yaml": "dir",
                "/project/package.json": "file",
            }),
        );
        mockFsReadFile.mockImplementation(
            mockFsReadFileImplementation({
                "/project/package.json": JSON.stringify({ name: "actual-root" }),
            }),
        );
        await expect(findRootDirFunction()).resolves.toBe("/project");
    });

    it("finds root if indicator is at the filesystem root itself", async () => {
        spyProcessCwd.mockReturnValue("/");
        mockFsStat.mockImplementation(
            mockFsStatImplementation({
                "/pnpm-workspace.yaml": "file",
            }),
        );
        await expect(findRootDirFunction()).resolves.toBe("/");
    });

    it("correctly identifies single package root at cwd if parent has no indicators", async () => {
        spyProcessCwd.mockReturnValue("/project/module-a");
        mockFsStat.mockImplementation(
            mockFsStatImplementation({
                "/project/module-a/package.json": "file",
                // No other indicators in /project or /
            }),
        );
        mockFsReadFile.mockImplementation(
            mockFsReadFileImplementation({
                "/project/module-a/package.json": JSON.stringify({ name: "module-a" }),
            }),
        );
        await expect(findRootDirFunction()).resolves.toBe("/project/module-a");
    });

    it("correctly identifies single package root in parent if cwd has no indicators", async () => {
        spyProcessCwd.mockReturnValue("/project/module-a/src");
        mockFsStat.mockImplementation(
            mockFsStatImplementation({
                "/project/module-a/package.json": "file",
            }),
        );
        mockFsReadFile.mockImplementation(
            mockFsReadFileImplementation({
                "/project/module-a/package.json": JSON.stringify({ name: "module-a" }),
            }),
        );
        await expect(findRootDirFunction()).resolves.toBe("/project/module-a");
    });
});
