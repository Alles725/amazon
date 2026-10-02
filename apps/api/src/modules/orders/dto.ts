import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsUUID, Matches, Max, Min } from 'class-validator';
import {
  AddressInput,
  CARD_BRANDS,
  CardBrand,
  InstallmentOption,
  OrderPaymentCard,
  CheckoutPricing,
  CheckoutQuote,
  CheckoutQuoteQuery,
  OrderLineResponse,
  OrderResponse,
  PlaceOrderRequest,
  SimulatedPayment,
} from '@amazon-mvp/api-contract';
import { CartResponseDto } from '../cart/dto';
import { AddressInputDto } from '../users/address.dto';
const PAYMENT_METHODS: SimulatedPayment[] = ['SIMULATED_CARD', 'SIMULATED_PIX'];
export class PlaceOrderDto implements PlaceOrderRequest {
  @ApiProperty({ format: 'uuid' }) @IsUUID() cartId: string;
  @ApiProperty({ description: 'Revision of a quote for this same paymentMethod' })
  @Matches(/^[a-f0-9]{64}$/)
  revision: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() addressId: string;
  @ApiProperty({ enum: PAYMENT_METHODS })
  @IsIn(PAYMENT_METHODS)
  paymentMethod: SimulatedPayment;
  @ApiPropertyOptional({
    format: 'uuid',
    description: 'SIMULATED_CARD only: saved card id; omitted pays with the demo Visa 4242',
  })
  @IsOptional()
  @IsUUID()
  cardId?: string;
  @ApiPropertyOptional({
    type: 'integer',
    minimum: 1,
    maximum: 24,
    default: 1,
    description: "SIMULATED_CARD only: one of the quote's installmentOptions",
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(24)
  installments?: number;
}
export class CheckoutQuoteQueryDto implements CheckoutQuoteQuery {
  @ApiPropertyOptional({
    enum: PAYMENT_METHODS,
    default: 'SIMULATED_CARD',
    description: 'Payment method to price; SIMULATED_PIX applies the Pix discount',
  })
  @IsOptional()
  @IsIn(PAYMENT_METHODS)
  paymentMethod?: SimulatedPayment;
}
export class CheckoutPricingDto implements CheckoutPricing {
  @ApiProperty({ type: 'integer', minimum: 0, maximum: 100, example: 5 })
  pixDiscountPercent: number;
  @ApiProperty({ type: 'integer', minimum: 1, maximum: 24, example: 10 })
  maxInstallments: number;
  @ApiProperty({ type: 'integer', minimum: 1, example: 500 })
  minInstallmentMinor: number;
}
export class InstallmentOptionDto implements InstallmentOption {
  @ApiProperty({ type: 'integer' }) count: number;
  @ApiProperty({ type: 'integer' }) installmentMinor: number;
  @ApiProperty({ type: 'integer' }) firstInstallmentMinor: number;
}
export class OrderPaymentCardDto implements OrderPaymentCard {
  @ApiProperty({ enum: CARD_BRANDS }) brand: CardBrand;
  @ApiProperty() last4: string;
}
export class OrderParamsDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() orderId: string;
}
export class CheckoutQuoteDto implements CheckoutQuote {
  @ApiProperty({ type: CartResponseDto }) cart: CartResponseDto;
  @ApiProperty() revision: string;
  @ApiProperty() subtotalMinor: number;
  @ApiProperty() shippingMinor: number;
  @ApiProperty() discountMinor: number;
  @ApiProperty() totalMinor: number;
  @ApiProperty() currency: string;
  @ApiProperty({ enum: PAYMENT_METHODS }) paymentMethod: SimulatedPayment;
  @ApiProperty({ type: 'integer', minimum: 0, maximum: 100 }) discountPercent: number;
  @ApiProperty({ type: [InstallmentOptionDto] }) installmentOptions: InstallmentOptionDto[];
}
export class OrderLineDto implements OrderLineResponse {
  @ApiProperty() productId: string;
  @ApiProperty() productName: string;
  @ApiProperty() sku: string;
  @ApiProperty() quantity: number;
  @ApiProperty() unitPriceMinor: number;
  @ApiProperty() lineTotalMinor: number;
  @ApiProperty() currency: string;
}
export class OrderResponseDto implements OrderResponse {
  @ApiProperty() id: string;
  @ApiProperty() orderNumber: string;
  @ApiProperty({ enum: ['PENDING', 'PAID', 'CANCELLED', 'FULFILLED'] })
  status: OrderResponse['status'];
  @ApiProperty() subtotalMinor: number;
  @ApiProperty() shippingMinor: number;
  @ApiProperty() discountMinor: number;
  @ApiProperty() totalMinor: number;
  @ApiProperty() currency: string;
  @ApiProperty({ type: AddressInputDto, nullable: true }) shippingAddress: AddressInput | null;
  @ApiProperty({ type: String, nullable: true }) paymentMethod: SimulatedPayment | null;
  @ApiProperty({ type: OrderPaymentCardDto, nullable: true })
  paymentCard: OrderPaymentCard | null;
  @ApiProperty({ type: 'integer', nullable: true }) installments: number | null;
  @ApiProperty() placedAt: string;
  @ApiProperty({ type: String, nullable: true }) deliveredAt: string | null;
  @ApiProperty({ type: String, nullable: true }) deliveryNote: string | null;
  @ApiProperty({ type: [OrderLineDto] }) lines: OrderLineDto[];
}
