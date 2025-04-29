import { OffchainLanguageConfigSchema } from "@ai-rules/types";
import { describe, expect, it } from "vitest";

describe("Offchain Default Configuration", () => {
    it("rejects invalid language values", () => {
        const result = OffchainLanguageConfigSchema.safeParse({
            language: "invalid",
        });
        expect(result.success).toBe(false);
    });
});
