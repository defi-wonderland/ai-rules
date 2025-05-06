/**
 * Compares two semantic version strings.
 *
 * @param v1 - The first version string.
 * @param v2 - The second version string.
 * @returns A positive number if v1 > v2, a negative number if v1 < v2, or 0 if v1 === v2.
 */
export function compareVersions(v1: string | undefined, v2: string | undefined): number {
    const version1 = (v1 || "0.0.0").split(".").map((part) => parseInt(part) || 0);
    const version2 = (v2 || "0.0.0").split(".").map((part) => parseInt(part) || 0);

    for (let i = 0; i < 3; i++) {
        const part1 = version1[i] || 0;
        const part2 = version2[i] || 0;
        if (part1 > part2) return 1;
        if (part1 < part2) return -1;
    }

    return 0;
}
