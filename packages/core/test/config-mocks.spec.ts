import { describe, expect, it } from "vitest";

import { ConfigSchema } from "../src/internal/schemas/config.js";
import { createMockConfig } from "./mocks/test-utils.js";

describe("Config Mocks", () => {
    describe("createMockConfig", () => {
        it("returns a valid configuration object", () => {
            const config = createMockConfig();

            // Verify it passes schema validation
            expect(() => ConfigSchema.parse(config)).not.toThrow();

            // Verify essential properties
            expect(config.version).toBe("1.0.0");
            expect(config.teams).toContain("offchain");
            expect(config.teams).toContain("solidity");
            expect(config.teams).toContain("ui");

            // Verify typescript settings
            expect(config.typescript?.language).toBe("typescript");

            // Verify solidity settings
            expect(config.solidity?.gasOptimizations).toBe(true);
            expect(config.solidity?.framework).toBe("foundry");
            expect(config.solidity?.testing?.framework).toBe("forge");
        });
    });
});
