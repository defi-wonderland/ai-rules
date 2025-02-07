import type { Mock } from "vitest";
import { mockMinimalConfig } from "@ai-rules/types";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FileSystemProvider } from "../../providers/filesystem-provider.js";
import { ConfigurationService } from "../../services/configuration.service.js";

vi.mock("../../providers/filesystem-provider", () => ({
    FileSystemProvider: vi.fn(),
}));

describe("ConfigurationService", () => {
    const basePath = "/test/path";
    const fileName = "config.json";
    let service: ConfigurationService;
    let mockProvider: {
        readConfig: Mock;
        writeConfig: Mock;
        exists: Mock;
    };

    beforeEach(() => {
        mockProvider = {
            readConfig: vi.fn(),
            writeConfig: vi.fn(),
            exists: vi.fn(),
        };

        vi.mocked(FileSystemProvider).mockImplementation(
            () => mockProvider as unknown as FileSystemProvider,
        );
        service = new ConfigurationService(mockProvider as unknown as FileSystemProvider);
    });

    describe("create", () => {
        it("creates instance with correct provider", async () => {
            const service = await ConfigurationService.create(basePath);

            expect(FileSystemProvider).toHaveBeenCalledWith(basePath);
            expect(service).toBeInstanceOf(ConfigurationService);
        });
    });

    describe("readConfig", () => {
        it("calls provider readConfig with correct params", async () => {
            mockProvider.readConfig.mockResolvedValue(mockMinimalConfig);

            const result = await service.readConfig(fileName);

            expect(mockProvider.readConfig).toHaveBeenCalledWith(fileName);
            expect(result).toEqual(mockMinimalConfig);
        });
    });

    describe("writeConfig", () => {
        it("calls provider writeConfig with correct params", async () => {
            await service.writeConfig(fileName, mockMinimalConfig);

            expect(mockProvider.writeConfig).toHaveBeenCalledWith(fileName, mockMinimalConfig);
        });
    });

    describe("hasConfig", () => {
        it("calls provider exists with correct params", async () => {
            mockProvider.exists.mockResolvedValue(true);

            const result = await service.hasConfig(fileName);

            expect(mockProvider.exists).toHaveBeenCalledWith(fileName);
            expect(result).toBe(true);
        });
    });
});
