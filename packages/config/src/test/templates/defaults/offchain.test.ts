import { OffchainLanguageConfigSchema } from "@ai-rules/types";
import { describe, expect, it } from "vitest";

import { offchainConfig } from "../../../templates/defaults/offchain.js";

describe("offchainConfig", () => {
    it("validates against OffchainLanguageConfigSchema", () => {
        const result = OffchainLanguageConfigSchema.safeParse(offchainConfig);
        expect(result.success).toBe(true);
    });

    it("contains correct default values", () => {
        expect(offchainConfig).toMatchObject({
            language: "typescript",
        });
    });

    it("rejects invalid language values", () => {
        const result = OffchainLanguageConfigSchema.safeParse({
            language: "invalid",
        });
        expect(result.success).toBe(false);
    });
});
