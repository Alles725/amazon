import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { LISTS_API } from './lists.api';
import { ListsController } from './lists.controller';
import { ListsService } from './lists.service';

@Module({
  imports: [CatalogModule],
  controllers: [ListsController],
  providers: [ListsService, { provide: LISTS_API, useExisting: ListsService }],
  exports: [LISTS_API],
})
export class ListsModule {}
