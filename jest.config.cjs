/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.(ts|js|mjs|html|svg)$': [
            'ts-jest',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
                //useESM: true,
            },
        ],
    },
    setupFilesAfterEnv: ['<rootDir>/test/setup-jest.ts'],
    //extensionsToTreatAsEsm: ['.ts'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
};
