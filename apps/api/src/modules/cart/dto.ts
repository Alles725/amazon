import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Max, Min } from 'class-validator';
import { CartItemResponse, CartResponse, MAX_CART_QUANTITY } from '@amazon-mvp/api-contract';
import { CatalogItemDto } from '../catalog/dto';

export class CartQuantityDto {
  @ApiProperty({ type: 'integer', minimum: 1, maximum: MAX_CART_QUANTITY })
  @IsInt()
  @Min(1)
  @Max(MAX_CART_QUANTITY)
  quantity: number;
}
export class AddCartItemDto extends CartQuantityDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() productId: string;
}
export class CartProductParamsDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() productId: string;
}
export class CartItemDto implements CartItemResponse {
  @ApiProperty({ format: 'uuid' }) productId: string;
  @ApiProperty({ type: CatalogItemDto }) product: CatalogItemDto;
  @ApiProperty({ type: 'integer' }) quantity: number;
  @ApiProperty({ type: 'integer' }) unitPriceMinor: number;
  @ApiProperty({ type: 'integer' }) lineTotalMinor: number;
}
export class CartResponseDto implements CartResponse {
  @ApiProperty({ type: String, format: 'uuid', nullable: true }) id: string | null;
  @ApiProperty({ format: 'uuid' }) userId: string;
  @ApiProperty({ type: [CartItemDto] }) lines: CartItemDto[];
  @ApiProperty({ type: 'integer' }) itemCount: number;
  @ApiProperty({ type: 'integer' }) subtotalMinor: number;
  @ApiProperty({ example: 'BRL' }) currency: string;
}
