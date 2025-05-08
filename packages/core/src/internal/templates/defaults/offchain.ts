import { OffchainLanguageConfigSchema } from "../../../internal/schemas/config.js";

/**
 * Default configuration for offchain teams
 */
export const offchainConfig = {
    language: "typescript",
} as const satisfies typeof OffchainLanguageConfigSchema._type;
