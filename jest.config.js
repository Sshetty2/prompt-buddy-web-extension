export default {
  preset              : 'ts-jest',
  testEnvironment     : 'jsdom',
  moduleNameMapper    : { '^@/(.*)$': '<rootDir>/src/$1' },
  setupFilesAfterEnv  : ['<rootDir>/src/__tests__/setup.ts'],
  testMatch           : ['**/__tests__/**/*.test.ts?(x)'],
  transform           : { '^.+\\.(ts|tsx)$': 'ts-jest' },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  globals             : {
    'ts-jest': {
      tsconfig       : 'tsconfig.json',
      isolatedModules: true
    }
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/vite-env.d.ts'
  ]
};
