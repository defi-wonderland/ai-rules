import { TeamType } from "@ai-rules/types";

import type { OffchainAnswers, SolidityAnswers } from "../providers/inquirer-provider.js";

type TeamAnswers = {
    [TeamType.enum.offchain]?: OffchainAnswers;
    [TeamType.enum.solidity]?: SolidityAnswers;
    [TeamType.enum.ui]?: Record<string, never>;
};

interface PromptState {
    teams: TeamType[];
    answers: TeamAnswers;
}

/**
 * Service for managing prompt state and answer persistence
 */
export class StateService {
    private state: PromptState = {
        teams: [],
        answers: {},
    };

    /**
     * Updates the selected teams
     */
    public setTeams(teams: TeamType[]): void {
        this.state.teams = teams;
    }

    /**
     * Updates answers for a specific team
     */
    public setTeamAnswers(
        team: TeamType,
        answers: OffchainAnswers | SolidityAnswers | Record<string, never>,
    ): void {
        switch (team) {
            case TeamType.enum.offchain:
                this.state.answers[team] = answers as OffchainAnswers;
                break;
            case TeamType.enum.solidity:
                this.state.answers[team] = answers as SolidityAnswers;
                break;
            case TeamType.enum.ui:
                this.state.answers[team] = answers as Record<string, never>;
                break;
        }
    }

    /**
     * Gets the current state
     */
    public getState(): PromptState {
        return structuredClone(this.state);
    }

    /**
     * Validates if all required answers are present
     */
    public validateCompleteness(): boolean {
        return this.state.teams.every((team) => team in this.state.answers);
    }
}
