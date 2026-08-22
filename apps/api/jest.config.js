/**
 * Unit tests only. Integration tests need PostgreSQL: see jest.integration.config.js
 *
 * isolatedModules => transpile-only. Type errors are the job of `pnpm typecheck`
 * (a separate CI step), so a unit-test run does not depend on the generated
 * Prisma client being present.
 */
module.exports = {
  testEnvironment: 'node',
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/../tsconfig.json', isolatedModules: true }] },
  moduleFileExtensions: ['js', 'json', 'ts'],
};
