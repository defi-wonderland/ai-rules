import { TeamType } from "@ai-rules/types";
import inquirer from "inquirer";

import type { IPromptProvider } from "../interfaces/prompt-provider.interface.js";

type TeamChoice = {
    name: string;
    value: TeamType;
};

type LanguageChoice = {
    name: string;
    value: "typescript" | "javascript";
};

export type TechStackAnswers = {
    teams: TeamType[];
};

export type OffchainAnswers = {
    language: "typescript" | "javascript";
};

export type SolidityAnswers = {
    gasOptimizations: boolean;
};

/**
 * Implementation of IPromptProvider using inquirer for interactive CLI prompts
 */
export class InquirerProvider implements IPromptProvider {
    /**
     * Gets the selected tech stacks from the user through interactive prompts
     * @returns Promise<TeamType[]> Array of selected tech stacks
     */
    async getTechStackSelection(): Promise<TeamType[]> {
        const choices: TeamChoice[] = [
            { name: "TypeScript/Javascript Back End", value: TeamType.enum.offchain },
            { name: "React Front End", value: TeamType.enum.ui },
            { name: "Solidity Contracts", value: TeamType.enum.solidity },
        ];

        const response = await inquirer.prompt<TechStackAnswers>([
            {
                type: "checkbox",
                name: "teams",
                message: "Which of these options will your project include?",
                choices,
            },
        ]);

        return response.teams;
    }

    /**
     * Gets team-specific configuration through interactive prompts
     * @param team The team type to get configuration for
     * @returns Promise<OffchainAnswers | SolidityAnswers | Record<string, never>> The team-specific configuration
     */
    async getTeamConfig(
        team: TeamType,
    ): Promise<OffchainAnswers | SolidityAnswers | Record<string, never>> {
        switch (team) {
            case TeamType.enum.offchain:
                return this.getOffchainConfig();
            case TeamType.enum.solidity:
                return this.getSolidityConfig();
            case TeamType.enum.ui:
                return {}; // UI team does not need additional config yet
            default:
                return {};
        }
    }

    /**
     * Gets Offchain-specific configuration through interactive prompts
     * @returns Promise<OffchainAnswers> The Offchain-specific configuration
     * @private
     */
    private async getOffchainConfig(): Promise<OffchainAnswers> {
        const choices: LanguageChoice[] = [
            { name: "TypeScript", value: "typescript" },
            { name: "JavaScript", value: "javascript" },
        ];

        const response = await inquirer.prompt<OffchainAnswers>([
            {
                type: "list",
                name: "language",
                message: "Select the language for your backend:",
                choices,
            },
        ]);

        return response;
    }

    /**
     * Gets Solidity-specific configuration through interactive prompts
     * @returns Promise<SolidityAnswers> The Solidity-specific configuration
     * @private
     */
    private async getSolidityConfig(): Promise<SolidityAnswers> {
        const response = await inquirer.prompt<SolidityAnswers>([
            {
                type: "confirm",
                name: "gasOptimizations",
                message: "Enable gas optimizations?",
                default: true,
            },
        ]);

        return response;
    }
}
