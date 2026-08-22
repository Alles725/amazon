import 'reflect-metadata';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { buildOpenApiDocument, createApp } from './bootstrap';

/**
 * Writes docs/openapi.json. Developer 3 owns this artifact; it MUST be
 * regenerated and committed in the same change as any API contract change.
 */
async function generate() {
  const { app } = await createApp();
  await app.init();

  const document = buildOpenApiDocument(app);
  const target = resolve(join(__dirname, '..', '..', '..', 'docs', 'openapi.json'));
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(document, null, 2)}\n`);

  await app.close();
  process.stdout.write(`OpenAPI written to ${target}\n`);
}

generate().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exit(1);
});
