import { Body, Controller, Get, Header, Inject, Param, Post, Query } from '@nestjs/common';
import { ApiCookieAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentAuth, AuthenticatedRequest, Public } from '../auth/session.guard';
import { ApiError } from '../../common/api-error';
import { ORDERS_API, OrdersApi } from './orders.api';
import {
  CheckoutPricingDto,
  CheckoutQuoteDto,
  CheckoutQuoteQueryDto,
  OrderParamsDto,
  OrderResponseDto,
  PlaceOrderDto,
} from './dto';
type Identity = NonNullable<AuthenticatedRequest['auth']>;
@ApiTags('orders')
@ApiCookieAuth()
@Controller('orders')
export class OrdersController {
  constructor(@Inject(ORDERS_API) private readonly orders: OrdersApi) {}
  /** Public: the rate advertised on product and cart pages ("X% de desconto no Pix"). */
  @Public()
  @Get('pricing')
  @Header('Cache-Control', 'no-store')
  @ApiOkResponse({ type: CheckoutPricingDto })
  pricing(): CheckoutPricingDto {
    return this.orders.pricing();
  }
  @Get('quote')
  @Header('Cache-Control', 'private, no-store')
  @ApiOkResponse({ type: CheckoutQuoteDto })
  quote(@CurrentAuth() auth: Identity, @Query() query: CheckoutQuoteQueryDto) {
    return this.orders.quote(auth.userId, query.paymentMethod);
  }
  @Post()
  @ApiCreatedResponse({ type: OrderResponseDto })
  place(@CurrentAuth() auth: Identity, @Body() dto: PlaceOrderDto) {
    return this.orders.placeOrderFromCart(auth.userId, dto);
  }
  @Get()
  @Header('Cache-Control', 'private, no-store')
  @ApiOkResponse({ type: [OrderResponseDto] })
  list(@CurrentAuth() auth: Identity) {
    return this.orders.listForUser(auth.userId);
  }
  @Get(':orderId')
  @Header('Cache-Control', 'private, no-store')
  @ApiOkResponse({ type: OrderResponseDto })
  async get(@CurrentAuth() auth: Identity, @Param() params: OrderParamsDto) {
    const order = await this.orders.findForUser(auth.userId, params.orderId);
    if (!order) throw ApiError.notFound('Order');
    return order;
  }
}
