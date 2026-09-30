import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  CATALOG_MAX_PAGE_SIZE,
  CATALOG_PRICE_BOUNDS_MINOR,
  CATALOG_SEARCH_MAX_LENGTH,
  CATALOG_SORTS,
  CatalogCategoryNode,
  CatalogFacets,
  CatalogItem,
  CatalogListQuery,
  CatalogPage,
  CatalogPriceBucket,
  CatalogProductDetails,
  CatalogSort,
} from '@amazon-mvp/api-contract';

/** Query-string booleans: only the literal words are accepted, anything else fails
 * validation instead of silently meaning "false". */
const toBoolean = ({ value }: { value: unknown }) =>
  value === 'true' || value === '1' ? true : value === 'false' || value === '0' ? false : value;

/** Search scope shared by the listing and the facets. */
export class CatalogScopeQueryDto {
  @ApiPropertyOptional({ description: 'Category slug; includes the whole subtree' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;
  @ApiPropertyOptional({
    description:
      'Text search, case- and accent-insensitive. Every word must appear in the name, ' +
      'the description or a category name of the product.',
    maxLength: CATALOG_SEARCH_MAX_LENGTH,
    example: 'fone bluetooth',
  })
  @IsOptional()
  @IsString()
  @MaxLength(CATALOG_SEARCH_MAX_LENGTH)
  q?: string;
  /** Curated storefront rails resolve their cards in one query instead of one per product;
   * brand listings pass the brand's products. */
  @ApiPropertyOptional({
    description: 'Comma-separated product slugs (at most 48); only these products are listed',
    type: String,
    example: 'p1,p6',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value
          .split(',')
          .map((slug) => slug.trim())
          .filter(Boolean)
      : value,
  )
  @IsArray()
  @ArrayMaxSize(CATALOG_MAX_PAGE_SIZE)
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  slugs?: string[];
}

export class CatalogQueryDto extends CatalogScopeQueryDto implements CatalogListQuery {
  @ApiPropertyOptional({ minimum: 1, maximum: 10000, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  page?: number;
  @ApiPropertyOptional({ minimum: 1, maximum: CATALOG_MAX_PAGE_SIZE, default: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(CATALOG_MAX_PAGE_SIZE)
  pageSize?: number;
  @ApiPropertyOptional({
    enum: CATALOG_SORTS,
    default: 'relevance',
    description:
      'relevance: text matches first (name > category > description), alphabetical ' +
      'without q; price-asc / price-desc: by priceMinor; newest: most recently created',
  })
  @IsOptional()
  @IsIn(CATALOG_SORTS)
  sort?: CatalogSort;
  @ApiPropertyOptional({ description: 'Inclusive minimum price, integer minor units', minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPriceMinor?: number;
  @ApiPropertyOptional({ description: 'Exclusive maximum price, integer minor units', minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxPriceMinor?: number;
  @ApiPropertyOptional({ description: 'Only products with unreserved stock', type: Boolean })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  inStock?: boolean;
}

export class CatalogItemDto implements CatalogItem {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty() sku: string;
  @ApiProperty() slug: string;
  @ApiProperty() name: string;
  @ApiProperty({ type: String, nullable: true }) description: string | null;
  @ApiProperty({ type: 'integer', minimum: 0 }) priceMinor: number;
  @ApiProperty({ example: 'BRL' }) currency: string;
  @ApiProperty() active: boolean;
  @ApiProperty({ type: 'integer', minimum: 0 }) availableQuantity: number;
  @ApiProperty() inStock: boolean;
}

export class CatalogPageDto implements CatalogPage {
  @ApiProperty({ type: [CatalogItemDto] }) items: CatalogItemDto[];
  @ApiProperty({ type: 'integer' }) total: number;
}

export class CatalogProductParamsDto {
  @ApiProperty({ description: 'Product UUID or slug' })
  @IsString()
  @MaxLength(200)
  productId: string;
}

export class CatalogCategoryDto {
  @ApiProperty() slug: string;
  @ApiProperty() name: string;
}

export class CatalogProductDetailsDto extends CatalogItemDto implements CatalogProductDetails {
  @ApiProperty({ type: [CatalogCategoryDto] }) categories: CatalogCategoryDto[];
  @ApiProperty({
    type: [CatalogCategoryDto],
    description: 'Root-to-leaf ancestor chain of the most specific category (breadcrumb)',
  })
  categoryPath: CatalogCategoryDto[];
}

export class CatalogCategoryNodeDto implements CatalogCategoryNode {
  @ApiProperty() slug: string;
  @ApiProperty() name: string;
  @ApiProperty({ type: String, nullable: true, description: 'null for a root category' })
  parentSlug: string | null;
}

export class CatalogPriceBucketDto implements CatalogPriceBucket {
  @ApiProperty({ type: 'integer', description: 'Inclusive, integer minor units' })
  minMinor: number;
  @ApiProperty({
    type: 'integer',
    nullable: true,
    description: 'Exclusive, integer minor units; null for the open-ended last bucket',
  })
  maxMinor: number | null;
  @ApiProperty({ type: 'integer' }) count: number;
}

export class CatalogCategoryCountDto {
  @ApiProperty() slug: string;
  @ApiProperty({ type: 'integer', description: 'Matched products in the whole subtree' })
  count: number;
}

export class CatalogFacetsDto implements CatalogFacets {
  @ApiProperty({ type: 'integer' }) total: number;
  @ApiProperty({ type: 'integer' }) inStock: number;
  @ApiProperty({
    type: [CatalogPriceBucketDto],
    description: `Buckets bounded by ${CATALOG_PRICE_BOUNDS_MINOR.join(', ')} (minor units)`,
  })
  priceBuckets: CatalogPriceBucketDto[];
  @ApiProperty({ type: [CatalogCategoryCountDto] }) categories: CatalogCategoryCountDto[];
  @ApiProperty({
    type: [String],
    description: 'Slugs of the matched products (capped), for presentation-only facets',
  })
  slugs: string[];
  @ApiProperty() slugsTruncated: boolean;
}
