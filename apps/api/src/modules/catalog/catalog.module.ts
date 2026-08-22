import { Module } from '@nestjs/common';

/**
 * Deliberately empty. Registering the module now fixes the ownership boundary
 * and lets Developer 1 merge before the feature exists. Enable the `catalog`
 * feature flag only once endpoints are implemented and tested.
 */
@Module({})
export class CatalogModule {}
