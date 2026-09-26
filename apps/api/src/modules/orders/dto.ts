import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsUUID, Matches } from 'class-validator';
import {
  AddressInput,
  CheckoutQuote,
  OrderLineResponse,
  OrderResponse,
  PlaceOrderRequest,
  SimulatedPayment,
} from '@amazon-mvp/api-contract';
import { CartResponseDto } from '../cart/dto';
import { AddressInputDto } from '../users/address.dto';
export class PlaceOrderDto implements PlaceOrderRequest {
  @ApiProperty({ format: 'uuid' }) @IsUUID() cartId: string;
  @ApiProperty() @Matches(/^[a-f0-9]{64}$/) revision: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() addressId: string;
  @ApiProperty({ enum: ['SIMULATED_CARD', 'SIMULATED_PIX'] })
  @IsIn(['SIMULATED_CARD', 'SIMULATED_PIX'])
  paymentMethod: SimulatedPayment;
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
  @ApiProperty() placedAt: string;
  @ApiProperty({ type: [OrderLineDto] }) lines: OrderLineDto[];
}
