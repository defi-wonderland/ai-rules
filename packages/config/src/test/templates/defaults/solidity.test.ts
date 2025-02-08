import { SolidityConfigSchema } from "@ai-rules/types";
import { describe, expect, it } from "vitest";

import { solidityConfig } from "../../../templates/defaults/solidity.js";

describe("solidityConfig", () => {
    it("validates against SolidityConfigSchema", () => {
        const result = SolidityConfigSchema.safeParse(solidityConfig);
        expect(result.success).toBe(true);
    });

    it("contains correct default values", () => {
        expect(solidityConfig).toMatchObject({
            gasOptimizations: true,
            framework: "foundry",
            testing: {
                framework: "forge",
            },
        });
    });
});
