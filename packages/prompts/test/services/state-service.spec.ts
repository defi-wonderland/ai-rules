import { TeamType } from "@ai-rules/types";
import { beforeEach, describe, expect, it } from "vitest";

import type { OffchainAnswers, SolidityAnswers } from "../../src/providers/inquirer-provider.js";
import { StateService } from "../../src/services/state.service.js";

describe("StateService", () => {
    let stateService: StateService;

    beforeEach(() => {
        stateService = new StateService();
    });

    it("initializes with empty state", () => {
        const initialState = stateService.getState();
        expect(initialState.teams).toEqual([]);
        expect(initialState.answers).toEqual({});
    });

    it("sets teams correctly", () => {
        const teams = [TeamType.enum.offchain, TeamType.enum.solidity];
        stateService.setTeams(teams);
        const state = stateService.getState();
        expect(state.teams).toEqual(teams);
    });

    it("sets offchain team answers correctly", () => {
        const offchainAnswers: OffchainAnswers = {
            language: "typescript",
        };
        stateService.setTeamAnswers(TeamType.enum.offchain, offchainAnswers);
        const state = stateService.getState();
        expect(state.answers[TeamType.enum.offchain]).toEqual(offchainAnswers);
    });

    it("sets solidity team answers correctly", () => {
        const solidityAnswers: SolidityAnswers = {
            gasOptimizations: true,
        };
        stateService.setTeamAnswers(TeamType.enum.solidity, solidityAnswers);
        const state = stateService.getState();
        expect(state.answers[TeamType.enum.solidity]).toEqual(solidityAnswers);
    });

    it("sets ui team answers correctly (empty object)", () => {
        const uiAnswers = {};
        stateService.setTeamAnswers(TeamType.enum.ui, uiAnswers);
        const state = stateService.getState();
        expect(state.answers[TeamType.enum.ui]).toEqual(uiAnswers);
    });

    it("getState returns a deep copy of the state", () => {
        const state1 = stateService.getState();
        state1.teams.push(TeamType.enum.ui); // Modify the returned state
        const state2 = stateService.getState();
        expect(state2.teams).toEqual([]); // Internal state remains unchanged
    });

    describe("validateCompleteness", () => {
        it("returns true when all selected teams have answers", () => {
            stateService.setTeams([TeamType.enum.offchain, TeamType.enum.solidity]);
            stateService.setTeamAnswers(TeamType.enum.offchain, { language: "typescript" });
            stateService.setTeamAnswers(TeamType.enum.solidity, { gasOptimizations: false });
            expect(stateService.validateCompleteness()).toBe(true);
        });

        it("returns false when some selected teams lack answers", () => {
            stateService.setTeams([TeamType.enum.offchain, TeamType.enum.solidity]);
            stateService.setTeamAnswers(TeamType.enum.offchain, { language: "javascript" });
            // No answers for solidity yet
            expect(stateService.validateCompleteness()).toBe(false);
        });

        it("returns true when no teams are selected", () => {
            stateService.setTeams([]);
            expect(stateService.validateCompleteness()).toBe(true);
        });

        it("returns false when teams are selected but no answers are set", () => {
            stateService.setTeams([TeamType.enum.ui]);
            expect(stateService.validateCompleteness()).toBe(false);
        });
    });
});
