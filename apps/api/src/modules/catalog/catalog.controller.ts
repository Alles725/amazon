import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/session.guard';
import { CATALOG_API, CatalogApi } from './catalog.api';
import { CatalogPageDto, CatalogQueryDto } from './dto';

@ApiTags('catalog')
@Controller('catalog/products')
export class CatalogController {
  constructor(@Inject(CATALOG_API) private readonly catalog: CatalogApi) {}

  /** Public read-only storefront data; no cart or account information. */
  @Public()
  @Get()
  @ApiOkResponse({ type: CatalogPageDto })
  list(@Query() query: CatalogQueryDto): Promise<CatalogPageDto> {
    return this.catalog.listProducts(query);
  }
}
