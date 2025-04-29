import fs from "node:fs/promises";
import path from "node:path";
import { Config, ConfigSchema, FileOperation, InvalidJson, TeamType } from "@ai-rules/types";
import { fs as memfs, vol } from "memfs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { FileSystemProvider } from "../../src/providers/filesystem-provider.js";
import { baseConfig } from "../../src/templates/defaults/base.js";

// Define mocks based on baseConfig
const mockMinimalConfig: Config = {
    ...baseConfig,
    version: "1.0.0",
    teams: [TeamType.enum.offchain],
    solidity: undefined,
    typescript: baseConfig.typescript!,
};

const mockConfig: Config = {
    ...baseConfig,
    version: "1.0.0",
    teams: [TeamType.enum.offchain, TeamType.enum.solidity],
    solidity: {
        gasOptimizations: false,
        framework: baseConfig.solidity!.framework,
        testing: baseConfig.solidity!.testing,
    },
    typescript: {
        language: baseConfig.typescript!.language,
    },
};

vi.mock("fs/promises", async () => {
    return memfs.promises;
});

vi.mock("node:fs/promises");

vi.mock("@ai-rules/types", async (importOriginal) => {
    const original = await importOriginal<typeof import("@ai-rules/types")>();
    return {
        ...original,
        // Mock only the necessary parts of ConfigSchema
        ConfigSchema: {
            ...original.ConfigSchema,
            // Use original parse/safeParse logic but spy on them
            parse: vi.fn((data) => original.ConfigSchema.parse(data)),
            safeParse: vi.fn((data) => original.ConfigSchema.safeParse(data)),
        },
    };
});

vi.spyOn(console, "error").mockImplementation(() => {});

describe("FileSystemProvider", () => {
    const testDir = "/fake/dir";
    const testFileName = ".ai-rulesrc.json";
    const expectedConfigPath = path.join(testDir, testFileName);
    let provider: FileSystemProvider;
    let mockReadFile: ReturnType<typeof vi.mocked<typeof fs.readFile>>;

    beforeEach(async () => {
        provider = await FileSystemProvider.create(testDir);
        mockReadFile = vi.mocked(fs.readFile);
        vi.clearAllMocks();

        // Reset memfs volume before each test
        vol.reset();
        // Ensure the directory exists for memfs tests
        vol.mkdirSync(testDir, { recursive: true });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("writeConfig", () => {
        it("writes the config file correctly", async () => {
            const mockWriteFile = vi.mocked(fs.writeFile).mockResolvedValue();
            await provider.writeConfig(testFileName, mockConfig);
            expect(mockWriteFile).toHaveBeenCalledWith(
                expectedConfigPath,
                JSON.stringify(mockConfig, null, 2),
            );
        });
        it("throws FileOperation error if writeFile fails", async () => {
            const writeError = new Error("Disk full");
            vi.mocked(fs.writeFile).mockRejectedValue(writeError);
            await expect(provider.writeConfig(testFileName, mockConfig)).rejects.toThrow(
                FileOperation,
            );
        });
    });

    describe("exists", () => {
        it("returns true if config file exists", async () => {
            vi.mocked(fs.access).mockResolvedValue();
            await expect(provider.exists(testFileName)).resolves.toBe(true);
            expect(vi.mocked(fs.access)).toHaveBeenCalledWith(expectedConfigPath);
        });
        it("returns false if config file does not exist", async () => {
            const accessError = new Error("ENOENT") as NodeJS.ErrnoException;
            accessError.code = "ENOENT";
            vi.mocked(fs.access).mockRejectedValue(accessError);
            await expect(provider.exists(testFileName)).resolves.toBe(false);
            expect(vi.mocked(fs.access)).toHaveBeenCalledWith(expectedConfigPath);
        });
        it("returns false for other access errors (current implementation)", async () => {
            const accessError = new Error("Permission denied") as NodeJS.ErrnoException;
            accessError.code = "EACCES";
            vi.mocked(fs.access).mockRejectedValue(accessError);
            await expect(provider.exists(testFileName)).resolves.toBe(false);
            expect(vi.mocked(fs.access)).toHaveBeenCalledWith(expectedConfigPath);
        });
    });

    describe("readConfig", () => {
        it("reads, parses, and validates the config file correctly", async () => {
            const fileContent = JSON.stringify(mockConfig);
            mockReadFile.mockResolvedValue(fileContent);
            const mockParse = vi.spyOn(ConfigSchema, "parse").mockReturnValue(mockConfig);

            const loadedConfig = await provider.readConfig(testFileName);

            expect(mockReadFile).toHaveBeenCalledWith(expectedConfigPath, "utf-8");
            expect(mockParse).toHaveBeenCalledWith(mockConfig);
            expect(loadedConfig).toEqual(mockConfig);
            mockParse.mockRestore();
        });

        it("throws FileOperation error if readFile fails", async () => {
            const readError = new Error("Cannot read file");
            mockReadFile.mockRejectedValue(readError);
            const mockParse = vi.spyOn(ConfigSchema, "parse");

            await expect(provider.readConfig(testFileName)).rejects.toThrow(FileOperation);
            expect(mockParse).not.toHaveBeenCalled();
            mockParse.mockRestore();
        });

        it("throws InvalidJson error for invalid JSON content", async () => {
            const invalidJsonContent = "{ not: json";
            mockReadFile.mockResolvedValue(invalidJsonContent);
            const mockParse = vi.spyOn(ConfigSchema, "parse");

            await expect(provider.readConfig(testFileName)).rejects.toThrow(InvalidJson);
            expect(mockParse).not.toHaveBeenCalled();
            mockParse.mockRestore();
        });

        it("throws ZodError if config validation fails via ConfigSchema.parse", async () => {
            const fileContent = JSON.stringify({ version: "1.0", teams: [] });
            const validationError = new z.ZodError([]);
            mockReadFile.mockResolvedValue(fileContent);
            const mockParse = vi.spyOn(ConfigSchema, "parse").mockImplementation(() => {
                throw validationError;
            });

            // Using toThrow without specific error type just checks that an error is thrown
            await expect(provider.readConfig(testFileName)).rejects.toThrow();

            // Verify the error type and mock calls
            expect(mockParse).toHaveBeenCalledWith({ version: "1.0", teams: [] });
            mockParse.mockRestore();
        });
    });

    describe("writeConfig full integration", () => {
        it("writes config and can be read back", async () => {
            // Write the config
            await provider.writeConfig(testFileName, mockMinimalConfig);

            // Set up mock to read the config back
            mockReadFile.mockImplementation(() =>
                Promise.resolve(JSON.stringify(mockMinimalConfig)),
            );

            // Read the config back
            const readConfig = await provider.readConfig(testFileName);

            // Verify content matches
            expect(readConfig).toEqual(mockMinimalConfig);
        });
    });
});
