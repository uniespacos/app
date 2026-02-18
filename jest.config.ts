import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/resources/js/$1',
  },
      transform: {
          '^.+\\.(ts|tsx)$': ['ts-jest', {
              tsconfig: 'tsconfig.json',
          }],
      },  testMatch: ['<rootDir>/resources/js/**/*.test.(ts|tsx)'],
};

export default config;