import { describe, expect, it } from "vitest";

import {
    ConfigSchema,
    OffchainLanguageConfigSchema,
    SolidityConfigSchema,
} from "../src/internal/schemas/config.js";
import { baseConfig } from "../src/internal/templates/defaults/base.js";
import { offchainConfig } from "../src/internal/templates/defaults/offchain.js";
import { solidityConfig } from "../src/internal/templates/defaults/solidity.js";

describe("Default Templates", () => {
    it("validates base config structure", () => {
        // Validate using schema
        expect(() => ConfigSchema.parse(baseConfig)).not.toThrow();

        // Check essential properties
        expect(baseConfig.version).toBeDefined();
        expect(baseConfig.teams).toBeDefined();
        expect(baseConfig.coderabbit).toBeDefined();
    });

    it("validates offchain config structure", () => {
        // Validate using schema
        expect(() => OffchainLanguageConfigSchema.parse(offchainConfig)).not.toThrow();

        // Check essential property
        expect(offchainConfig.language).toBe("typescript");
    });

    it("validates solidity config structure", () => {
        // Validate using schema
        expect(() => SolidityConfigSchema.parse(solidityConfig)).not.toThrow();

        // Check essential properties
        expect(solidityConfig.gasOptimizations).toBe(true);
        expect(solidityConfig.framework).toBe("foundry");
        expect(solidityConfig.testing.framework).toBe("forge");
    });
});
