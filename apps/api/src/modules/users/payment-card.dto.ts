import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  CARD_BRANDS,
  CARD_HOLDER_MAX_LENGTH,
  CardBrand,
  PaymentCardInput,
  SavedPaymentCard,
} from '@amazon-mvp/api-contract';
const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

/** Deliberately has no field for the card number or CVV: the whitelist rejects them. */
export class PaymentCardInputDto implements PaymentCardInput {
  @ApiProperty({ enum: CARD_BRANDS }) @IsIn(CARD_BRANDS) brand: CardBrand;
  @ApiProperty({ example: '1111' }) @Matches(/^\d{4}$/) last4: string;
  @ApiProperty({ maxLength: CARD_HOLDER_MAX_LENGTH })
  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(CARD_HOLDER_MAX_LENGTH)
  holderName: string;
  @ApiProperty({ minimum: 1, maximum: 12 }) @IsInt() @Min(1) @Max(12) expMonth: number;
  @ApiProperty({ minimum: 2000, maximum: 2099 }) @IsInt() @Min(2000) @Max(2099) expYear: number;
}
export class SavedPaymentCardDto extends PaymentCardInputDto implements SavedPaymentCard {
  @ApiProperty({ format: 'uuid' }) id: string;
}
export class PaymentCardParamsDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() cardId: string;
}
