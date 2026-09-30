import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/session.guard';
import { CATALOG_API, CatalogApi } from './catalog.api';
import { CatalogCategoryNodeDto, CatalogFacetsDto, CatalogScopeQueryDto } from './dto';

/** Public read-only data for listing pages: the taxonomy and facet counts. */
@ApiTags('catalog')
@Controller('catalog')
export class CatalogBrowseController {
  constructor(@Inject(CATALOG_API) private readonly catalog: CatalogApi) {}

  @Public()
  @Get('categories')
  @ApiOkResponse({ type: [CatalogCategoryNodeDto] })
  categories(): Promise<CatalogCategoryNodeDto[]> {
    return this.catalog.listCategories();
  }

  /** Counts over the search scope (q + category + slugs); price and stock refinements do
   * not change them. */
  @Public()
  @Get('facets')
  @ApiOkResponse({ type: CatalogFacetsDto })
  facets(@Query() query: CatalogScopeQueryDto): Promise<CatalogFacetsDto> {
    return this.catalog.productFacets(query);
  }
}
