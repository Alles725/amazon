import { Module } from '@nestjs/common';
import { CATALOG_API } from './catalog.api';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';
import { CatalogBrowseController } from './catalog-browse.controller';

@Module({
  controllers: [CatalogController, CatalogBrowseController],
  providers: [CatalogService, { provide: CATALOG_API, useExisting: CatalogService }],
  exports: [CATALOG_API],
})
export class CatalogModule {}
