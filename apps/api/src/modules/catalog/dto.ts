import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { CatalogItem, CatalogPage, CatalogProductDetails } from '@amazon-mvp/api-contract';

export class CatalogQueryDto {
  @ApiPropertyOptional({ minimum: 1, maximum: 10000, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  page?: number;
  @ApiPropertyOptional({ minimum: 1, maximum: 48, default: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(48)
  pageSize?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;
  /** Curated storefront rails resolve their cards in one query instead of one per product. */
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
  @ArrayMaxSize(48)
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  slugs?: string[];
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
