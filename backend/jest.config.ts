// jest.config.ts
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 30000,
  setupFilesAfterEnv: ['<rootDir>/tests/globalSetup.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  transformIgnorePatterns: ['/node_modules/'],
  // Ajout config spécifique pour les tests d'acceptance
  projects: [
    {
      displayName: 'acceptance',
      preset: 'ts-jest',
      testMatch: ['<rootDir>/tests/acceptance/**/*.test.ts'],
      globalSetup: '<rootDir>/tests/globalSetup.acceptance.cjs',
      globalTeardown: '<rootDir>/tests/globalTeardown.acceptance.cjs',
      setupFilesAfterEnv: ['<rootDir>/tests/setupAcceptance.ts'],
      testEnvironment: 'node',
      testTimeout: 30000,
      transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
      },
      transformIgnorePatterns: ['/node_modules/'],
    },
    {
      displayName: 'default',
      preset: 'ts-jest',
      testMatch: ['<rootDir>/tests/**/*.test.ts', '!<rootDir>/tests/acceptance/**/*.test.ts'],
      setupFilesAfterEnv: ['<rootDir>/tests/globalSetup.ts'],
      testEnvironment: 'node',
      testTimeout: 30000,
      transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
      },
      transformIgnorePatterns: ['/node_modules/'],
      testPathIgnorePatterns: ['<rootDir>/tests/acceptance/'],
    },
  ],
};
