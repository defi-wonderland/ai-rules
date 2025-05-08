import { type PathLike } from "fs";
import * as fs from "fs/promises";
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
    let mockFsAccess: MockedFunction<typeof fs.access>;

    let spyProcessExit: MockInstance<any>;
    let spyProcessCwd: MockInstance<any>;
    let spyConsoleLog: MockInstance<any>;
    let spyConsoleError: MockInstance<any>;
    let spyConsoleWarn: MockInstance<any>;

    let mockGenerateAll: MockedFunction<() => Promise<void>>;

    beforeAll(async () => {
        mockInquirerPrompt = vi.mocked(inquirer.prompt);

        const fsPromises = await import("fs/promises");
        mockFsAccess = vi.mocked(fsPromises.access);
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

        mockInquirerPrompt.mockResolvedValue({ confirm: true } as any);
        mockFsAccess.mockRejectedValue(new Error("ENOENT"));
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
        (accessError as any).code = "EACCES";
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
});
