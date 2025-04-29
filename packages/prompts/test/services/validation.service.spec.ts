import type { Mock, Mocked } from "vitest";
import { TeamType } from "@ai-rules/types";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { OffchainAnswers, SolidityAnswers } from "../../src/providers/inquirer-provider.js";
import { StateService } from "../../src/services/state.service.js";
import { ValidationService } from "../../src/services/validation.service.js";

vi.mock("../../src/services/state.service.js");

describe("ValidationService", () => {
    let validationService: ValidationService;
    let mockStateServiceInstance: Mocked<StateService>;
    let mockGetState: Mock;

    beforeEach(() => {
        mockStateServiceInstance = new StateService() as Mocked<StateService>;
        mockGetState = vi.fn();
        mockStateServiceInstance.getState = mockGetState;

        validationService = new ValidationService(mockStateServiceInstance);

        vi.clearAllMocks();
    });

    describe("validateOffchainConfig", () => {
        it("parses valid offchain answers", () => {
            const answers: OffchainAnswers = { language: "typescript" };
            const expectedConfig = { language: "typescript" };

            const result = validationService.validateOffchainConfig(answers);

            expect(result).toEqual(expectedConfig);
        });

        it("throws validation error for invalid offchain answers", () => {
            const invalidAnswers: Partial<OffchainAnswers> = {};

            expect(() =>
                validationService.validateOffchainConfig(invalidAnswers as OffchainAnswers),
            ).toThrow();
        });
    });

    describe("validateSolidityConfig", () => {
        it("parses valid solidity answers and adds defaults", () => {
            const answers: SolidityAnswers = { gasOptimizations: true };
            const expectedConfig = {
                gasOptimizations: true,
                framework: "foundry",
                testing: { framework: "forge" },
            };

            const result = validationService.validateSolidityConfig(answers);

            expect(result).toEqual(expectedConfig);
        });

        it("applies default value if gasOptimizations is missing", () => {
            const answersWithoutGasOpt: Partial<SolidityAnswers> = {};
            const expectedConfigWithDefault = {
                gasOptimizations: true,
                framework: "foundry",
                testing: { framework: "forge" },
            };

            const result = validationService.validateSolidityConfig(
                answersWithoutGasOpt as SolidityAnswers,
            );

            expect(result).toEqual(expectedConfigWithDefault);
        });
    });

    // --- Tests for validateConfiguration ---
    describe("validateConfiguration", () => {
        it("returns error if no teams are selected", () => {
            // Setup mock state
            mockGetState.mockReturnValue({ teams: [], answers: {} });

            const errors = validationService.validateConfiguration();

            expect(mockGetState).toHaveBeenCalledTimes(1);
            expect(errors).toHaveLength(1);
            expect(errors[0]).toContain("At least one team must be selected");
        });

        it("returns no errors if only one team is selected", () => {
            mockGetState.mockReturnValue({
                teams: [TeamType.enum.offchain],
                answers: { [TeamType.enum.offchain]: { language: "typescript" } },
            });
            const errors = validationService.validateConfiguration();
            expect(errors).toHaveLength(0);
        });

        it("returns no errors for valid Solidity and Offchain combination", () => {
            mockGetState.mockReturnValue({
                teams: [TeamType.enum.solidity, TeamType.enum.offchain],
                answers: {
                    [TeamType.enum.solidity]: { gasOptimizations: false },
                    [TeamType.enum.offchain]: { language: "typescript" },
                },
            });
            const errors = validationService.validateConfiguration();
            expect(errors).toHaveLength(0);
        });

        it("returns specific error for invalid Solidity (gasOpt) and Offchain (JS) combination", () => {
            mockGetState.mockReturnValue({
                teams: [TeamType.enum.solidity, TeamType.enum.offchain],
                answers: {
                    [TeamType.enum.solidity]: { gasOptimizations: true }, // Invalid combo
                    [TeamType.enum.offchain]: { language: "javascript" }, // Invalid combo
                },
            });
            const errors = validationService.validateConfiguration();
            expect(errors).toHaveLength(1);
            expect(errors[0]).toContain("Gas optimizations are recommended"); // Check specific error message
        });

        it("returns no error if solidity/offchain selected but answers missing (handled by completeness)", () => {
            // This tests that validateConfiguration itself doesn't fail if answers are missing,
            // as that check belongs elsewhere (e.g., StateService.validateCompleteness)
            mockGetState.mockReturnValue({
                teams: [TeamType.enum.solidity, TeamType.enum.offchain],
                answers: {
                    // Missing answers for one or both
                },
            });
            const errors = validationService.validateConfiguration();
            // validateSolidityOffchainCombination handles undefined safely
            expect(errors).toHaveLength(0);
        });
    });
});
