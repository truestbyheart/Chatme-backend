module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts'],
  preset: 'ts-jest',
  clearMocks: true,
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
};
