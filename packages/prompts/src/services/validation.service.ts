import {
    OffchainLanguageConfig,
    OffchainLanguageConfigSchema,
    SolidityConfig,
    SolidityConfigSchema,
    TeamType,
} from "@ai-rules/types";

import type { OffchainAnswers, SolidityAnswers } from "../providers/inquirer-provider.js";
import { StateService } from "./state.service.js";

/**
 * Service for validating user answers using Zod schemas
 */
export class ValidationService {
    constructor(private stateService: StateService) {}

    /**
     * Validates Offchain configuration answers
     * @param answers The raw answers from the prompt
     * @returns The validated configuration
     */
    validateOffchainConfig(answers: OffchainAnswers): OffchainLanguageConfig {
        return OffchainLanguageConfigSchema.parse({
            language: answers.language,
        });
    }

    /**
     * Validates Solidity configuration answers
     * @param answers The raw answers from the prompt
     * @returns The validated configuration
     */
    validateSolidityConfig(answers: SolidityAnswers): SolidityConfig {
        return SolidityConfigSchema.parse({
            gasOptimizations: answers.gasOptimizations,
            framework: "foundry" as const,
            testing: { framework: "forge" as const },
        });
    }

    /**
     * Validates the entire configuration state
     */
    public validateConfiguration(): string[] {
        const errors: string[] = [];
        const state = this.stateService.getState();

        // Validate team selection
        if (state.teams.length === 0) {
            errors.push("At least one team must be selected");
        }

        // Cross-validate Solidity and Offchain configurations
        if (
            state.teams.includes(TeamType.enum.solidity) &&
            state.teams.includes(TeamType.enum.offchain)
        ) {
            errors.push(
                ...this.validateSolidityOffchainCombination(
                    state.answers[TeamType.enum.solidity],
                    state.answers[TeamType.enum.offchain],
                ),
            );
        }

        return errors;
    }

    /**
     * Validates combination of Solidity and Offchain configurations
     */
    private validateSolidityOffchainCombination(
        solidityAnswers?: SolidityAnswers,
        offchainAnswers?: OffchainAnswers,
    ): string[] {
        const errors: string[] = [];

        // Add specific validation rules for combined configurations
        if (solidityAnswers?.gasOptimizations && offchainAnswers?.language === "javascript") {
            errors.push(
                "Gas optimizations are recommended to use with TypeScript for better type safety",
            );
        }

        return errors;
    }
}
