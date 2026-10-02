import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { AccountAddress, AddressInput, SavedAddress } from '@amazon-mvp/api-contract';
const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class AddressInputDto implements AddressInput {
  @ApiProperty() @Transform(trim) @IsString() @MinLength(2) @MaxLength(100) recipient: string;
  @ApiProperty({ example: '90020060' }) @Transform(trim) @Matches(/^\d{8}$/) postalCode: string;
  @ApiProperty() @Transform(trim) @IsString() @MinLength(2) @MaxLength(150) street: string;
  @ApiProperty() @Transform(trim) @IsString() @MinLength(1) @MaxLength(20) number: string;
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100)
  complement?: string;
  @ApiProperty() @Transform(trim) @IsString() @MinLength(2) @MaxLength(100) neighborhood: string;
  @ApiProperty() @Transform(trim) @IsString() @MinLength(2) @MaxLength(100) city: string;
  @ApiProperty()
  @Transform(trim)
  @IsString()
  @Length(2, 2)
  @IsIn([
    'AC',
    'AL',
    'AP',
    'AM',
    'BA',
    'CE',
    'DF',
    'ES',
    'GO',
    'MA',
    'MT',
    'MS',
    'MG',
    'PA',
    'PB',
    'PR',
    'PE',
    'PI',
    'RJ',
    'RN',
    'RS',
    'RO',
    'RR',
    'SC',
    'SP',
    'SE',
    'TO',
  ])
  state: string;
  @ApiPropertyOptional({ example: '54996704398', description: 'DDD + número, digits only' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.replace(/\D/g, '') : value))
  @Matches(/^(\d{10,11})?$/)
  phone?: string;
  @ApiPropertyOptional({ description: 'Omit to keep the stored value; empty clears it' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(300)
  deliveryInstructions?: string;
}
export class SavedAddressDto extends AddressInputDto implements SavedAddress {
  @ApiProperty({ format: 'uuid' }) id: string;
}
export class AccountAddressDto extends SavedAddressDto implements AccountAddress {
  @ApiProperty({ description: 'At most one address per account is the default' })
  isDefault: boolean;
}
export class AddressParamsDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() addressId: string;
}
