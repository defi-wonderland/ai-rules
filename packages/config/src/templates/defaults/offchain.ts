import { OffchainLanguageConfigSchema } from "@ai-rules/types";

/**
 * Default configuration for offchain teams
 */
export const offchainConfig = {
    language: "typescript",
} as const satisfies typeof OffchainLanguageConfigSchema._type;
