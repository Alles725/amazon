import { Controller, Get, Header, Inject, NotFoundException, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/session.guard';
import { CATALOG_API, CatalogApi } from './catalog.api';
import {
  CatalogPageDto,
  CatalogQueryDto,
  CatalogProductDetailsDto,
  CatalogProductParamsDto,
} from './dto';

@ApiTags('catalog')
@Controller('catalog/products')
export class CatalogController {
  constructor(@Inject(CATALOG_API) private readonly catalog: CatalogApi) {}

  @Public()
  @Get(':productId')
  @Header('Cache-Control', 'no-store')
  @ApiOkResponse({ type: CatalogProductDetailsDto })
  @ApiNotFoundResponse({ description: 'Product not found' })
  async detail(@Param() params: CatalogProductParamsDto): Promise<CatalogProductDetailsDto> {
    const product = await this.catalog.getProduct(params.productId);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  /** Public read-only storefront data; no cart or account information. */
  @Public()
  @Get()
  @ApiOkResponse({ type: CatalogPageDto })
  list(@Query() query: CatalogQueryDto): Promise<CatalogPageDto> {
    return this.catalog.listProducts(query);
  }
}
