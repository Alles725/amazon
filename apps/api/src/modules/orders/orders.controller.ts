import { Body, Controller, Get, Header, Inject, Param, Post } from '@nestjs/common';
import { ApiCookieAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentAuth, AuthenticatedRequest } from '../auth/session.guard';
import { ApiError } from '../../common/api-error';
import { ORDERS_API, OrdersApi } from './orders.api';
import { CheckoutQuoteDto, OrderParamsDto, OrderResponseDto, PlaceOrderDto } from './dto';
type Identity = NonNullable<AuthenticatedRequest['auth']>;
@ApiTags('orders')
@ApiCookieAuth()
@Controller('orders')
export class OrdersController {
  constructor(@Inject(ORDERS_API) private readonly orders: OrdersApi) {}
  @Get('quote')
  @Header('Cache-Control', 'private, no-store')
  @ApiOkResponse({ type: CheckoutQuoteDto })
  quote(@CurrentAuth() auth: Identity) {
    return this.orders.quote(auth.userId);
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
