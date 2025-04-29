import { type PathLike } from "fs";
import * as path from "path";
import type { MockInstance } from "vitest";
import { TemplateGenerator } from "@ai-rules/generators";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { run } from "../src/index.js";

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
        mkdir: vi.fn().mockResolvedValue(undefined),
    };
});

describe("Core Script (run function)", () => {
    let mockInquirerPrompt: ReturnType<typeof vi.fn>;
    let mockFsAccess: ReturnType<typeof vi.fn>;
    let mockFsMkdir: ReturnType<typeof vi.fn>;
    let spyGenerateAll: MockInstance<() => Promise<void>>;

    let spyProcessExit: MockInstance<(code?: number | undefined) => never>;
    let spyProcessCwd: MockInstance<() => string>;
    let spyConsoleLog: MockInstance<(message?: any, ...optionalParams: any[]) => void>;
    let spyConsoleError: MockInstance<(message?: any, ...optionalParams: any[]) => void>;
    let spyConsoleWarn: MockInstance<(message?: any, ...optionalParams: any[]) => void>;

    beforeAll(async () => {
        const inquirer = await import("inquirer");
        mockInquirerPrompt = vi.mocked(inquirer.default.prompt);

        const fsPromises = await import("fs/promises");
        mockFsAccess = vi.mocked(fsPromises.access);
        mockFsMkdir = vi.mocked(fsPromises.mkdir);
    });

    beforeEach(() => {
        vi.resetAllMocks();

        spyGenerateAll = vi
            .spyOn(TemplateGenerator.prototype, "generateAll")
            .mockResolvedValue(undefined);

        spyProcessExit = vi.spyOn(process, "exit").mockImplementation((_code?: number) => {
            throw new Error(`process.exit called with ${_code ?? "no code"}`);
        });
        spyProcessCwd = vi.spyOn(process, "cwd").mockReturnValue("/fake/project/dir");
        spyConsoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
        spyConsoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        spyConsoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

        mockInquirerPrompt.mockResolvedValue({ confirm: true });
        mockFsAccess.mockRejectedValue(new Error("ENOENT"));
        mockFsMkdir.mockResolvedValue(undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("runs successfully and generates files when no existing config is found", async () => {
        await run();
        expect(spyConsoleLog).toHaveBeenCalledWith("Starting AI Rules installation...");
        expect(mockFsAccess).toHaveBeenCalledWith(
            path.join("/fake/project/dir", ".coderabbit.yaml"),
        );
        expect(mockFsAccess).toHaveBeenCalledWith(path.join("/fake/project/dir", ".cursor"));
        expect(mockInquirerPrompt).not.toHaveBeenCalled();
        expect(spyGenerateAll).toHaveBeenCalledTimes(1);
        expect(spyGenerateAll).toHaveBeenCalledWith();
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
        expect(spyGenerateAll).toHaveBeenCalledTimes(1);
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
        expect(spyGenerateAll).toHaveBeenCalledTimes(1);
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
        expect(spyGenerateAll).not.toHaveBeenCalled();
        expect(spyProcessExit).not.toHaveBeenCalled();
    });

    it("handles error during generation and exits with code 1", async () => {
        const generationError = new Error("Failed to generate");
        spyGenerateAll.mockRejectedValue(generationError);
        await expect(run()).rejects.toThrow("process.exit called with 1");
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
        expect(spyGenerateAll).toHaveBeenCalledTimes(1);
        expect(spyConsoleLog).toHaveBeenCalledWith(
            "✅ AI Rules configuration files generated successfully!",
        );
        expect(spyProcessExit).not.toHaveBeenCalled();
    });

    it("handles error during fs.access check and proceeds without prompt", async () => {
        const accessError = new Error("Permission denied");
        mockFsAccess.mockRejectedValue(accessError);
        await run();
        expect(mockInquirerPrompt).not.toHaveBeenCalled();
        expect(spyGenerateAll).toHaveBeenCalledTimes(1);
        expect(spyConsoleLog).toHaveBeenCalledWith(
            "✅ AI Rules configuration files generated successfully!",
        );
        expect(spyProcessExit).not.toHaveBeenCalled();
    });
});
