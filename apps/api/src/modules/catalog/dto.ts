import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { CatalogItem, CatalogPage } from '@amazon-mvp/api-contract';

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
