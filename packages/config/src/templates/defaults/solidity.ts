import { SolidityConfigSchema } from "@ai-rules/types";

/**
 * Default configuration for Solidity teams
 */
export const solidityConfig = {
    gasOptimizations: true,
    framework: "foundry",
    testing: {
        framework: "forge",
    },
} as const satisfies typeof SolidityConfigSchema._type;
