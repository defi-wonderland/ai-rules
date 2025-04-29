import { TeamType } from "@ai-rules/types";

import type { OffchainAnswers, SolidityAnswers } from "../providers/inquirer-provider.js";

/**
 * Interface defining the contract for prompt providers
 */
export interface IPromptProvider {
    /**
     * Gets the selected tech stacks from the user
     * @returns Promise<TeamType[]> Array of selected tech stacks
     */
    getTechStackSelection(): Promise<TeamType[]>;

    /**
     * Gets team-specific configuration through interactive prompts
     * @param team The team type to get configuration for
     * @returns Promise<unknown> The team-specific configuration
     */
    getTeamConfig(
        team: TeamType,
    ): Promise<OffchainAnswers | SolidityAnswers | Record<string, never>>;
}
