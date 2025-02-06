module.exports = {
    extends: ["../../.eslintrc.cjs"],
    parserOptions: {
        project: ["./tsconfig.json", "./tsconfig.build.json"],
        tsconfigRootDir: __dirname,
    },
    overrides: [
        {
            files: ["*.d.ts"],
            rules: {
                "import/no-unresolved": "off",
                "@typescript-eslint/explicit-module-boundary-types": "off",
            },
        },
    ],
    rules: {
        "@typescript-eslint/no-namespace": "off",
        "@typescript-eslint/no-explicit-any": "error",
    },
};
