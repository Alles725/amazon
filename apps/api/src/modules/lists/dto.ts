import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsUUID, Length } from 'class-validator';
import {
  AddListItemRequest,
  LIST_NAME_MAX_LENGTH,
  ListDetails,
  ListItemResponse,
  ListNameRequest,
  ListSummary,
} from '@amazon-mvp/api-contract';
import { CatalogItemDto } from '../catalog/dto';

export class ListNameDto implements ListNameRequest {
  @ApiProperty({ example: 'Presentes', minLength: 1, maxLength: LIST_NAME_MAX_LENGTH })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, LIST_NAME_MAX_LENGTH)
  name: string;
}
export class AddListItemDto implements AddListItemRequest {
  @ApiProperty({ format: 'uuid' }) @IsUUID() productId: string;
}
export class ListParamsDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() listId: string;
}
export class ListItemParamsDto extends ListParamsDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() productId: string;
}
export class ListSummaryDto implements ListSummary {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty() name: string;
  @ApiProperty() isDefault: boolean;
  @ApiProperty({ type: 'integer' }) itemCount: number;
  @ApiProperty({ format: 'date-time' }) createdAt: string;
}
export class ListItemDto implements ListItemResponse {
  @ApiProperty({ format: 'uuid' }) productId: string;
  @ApiProperty({ format: 'date-time' }) addedAt: string;
  @ApiProperty({ type: CatalogItemDto }) product: CatalogItemDto;
}
export class ListDetailsDto extends ListSummaryDto implements ListDetails {
  @ApiProperty({ type: [ListItemDto] }) items: ListItemDto[];
}
