import { access, readFile, writeFile } from "fs/promises";
import { join } from "path";
import { mockConfig, mockMinimalConfig } from "@ai-rules/types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FileSystemProvider } from "../../providers/filesystem-provider.js";

vi.mock("fs/promises", () => ({
    readFile: vi.fn(),
    writeFile: vi.fn(),
    access: vi.fn(),
}));

describe("FileSystemProvider", () => {
    const basePath = "/test/path";
    const fileName = "config.json";
    let provider: FileSystemProvider;

    beforeEach(async () => {
        provider = await FileSystemProvider.create(basePath);
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("readConfig", () => {
        it("reads and parses JSON file correctly", async () => {
            vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockConfig));

            const result = await provider.readConfig(fileName);

            expect(readFile).toHaveBeenCalledWith(join(basePath, fileName), "utf-8");
            expect(result).toEqual(mockConfig);
        });

        it("throws error when file read fails", async () => {
            vi.mocked(readFile).mockRejectedValue(new Error("File read error"));

            await expect(provider.readConfig(fileName)).rejects.toThrow("File read error");
        });
    });

    describe("writeConfig", () => {
        it("writes config to file correctly", async () => {
            await provider.writeConfig(fileName, mockMinimalConfig);

            expect(writeFile).toHaveBeenCalledWith(
                join(basePath, fileName),
                JSON.stringify(mockMinimalConfig, null, 2),
            );
        });

        it("throws error when file write fails", async () => {
            vi.mocked(writeFile).mockRejectedValue(new Error("File write error"));

            await expect(provider.writeConfig(fileName, mockMinimalConfig)).rejects.toThrow(
                "File write error",
            );
        });
    });

    describe("exists", () => {
        it("returns true when file exists", async () => {
            vi.mocked(access).mockResolvedValue(undefined);

            const result = await provider.exists(fileName);

            expect(result).toBe(true);
            expect(access).toHaveBeenCalledWith(join(basePath, fileName));
        });

        it("returns false when file does not exist", async () => {
            vi.mocked(access).mockRejectedValue(new Error("File not found"));

            const result = await provider.exists(fileName);

            expect(result).toBe(false);
            expect(access).toHaveBeenCalledWith(join(basePath, fileName));
        });
    });
});
