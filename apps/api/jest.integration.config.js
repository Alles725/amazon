/**
 * Requires a reachable PostgreSQL instance in DATABASE_URL and applied migrations.
 *   make migrate && pnpm --filter @amazon-mvp/api test:integration
 */
module.exports = {
  testEnvironment: 'node',
  rootDir: 'test',
  testRegex: '.*\\.e2e-spec\\.ts$',
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/../tsconfig.json', isolatedModules: true }] },
  moduleFileExtensions: ['js', 'json', 'ts'],
  testTimeout: 30000,
};
