import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentAuth, AuthenticatedRequest } from '../auth/session.guard';
import { ApiErrorResponseDto } from '../auth/dto';
import { CART_API, CartApi } from './cart.api';
import { AddCartItemDto, CartProductParamsDto, CartQuantityDto, CartResponseDto } from './dto';

type Identity = NonNullable<AuthenticatedRequest['auth']>;

@ApiTags('cart')
@ApiCookieAuth()
@ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
@ApiBadRequestResponse({ type: ApiErrorResponseDto })
@ApiNotFoundResponse({ type: ApiErrorResponseDto })
@ApiConflictResponse({ type: ApiErrorResponseDto })
@Controller('cart')
export class CartController {
  constructor(@Inject(CART_API) private readonly cart: CartApi) {}

  @Get()
  @Header('Cache-Control', 'private, no-store')
  @ApiOkResponse({ type: CartResponseDto })
  get(@CurrentAuth() auth: Identity) {
    return this.cart.getActiveCart(auth.userId);
  }

  @Post('items')
  @HttpCode(200)
  @ApiOkResponse({ type: CartResponseDto })
  add(@CurrentAuth() auth: Identity, @Body() dto: AddCartItemDto) {
    return this.cart.addItem(auth.userId, dto.productId, dto.quantity);
  }

  @Patch('items/:productId')
  @ApiOkResponse({ type: CartResponseDto })
  update(
    @CurrentAuth() auth: Identity,
    @Param() params: CartProductParamsDto,
    @Body() dto: CartQuantityDto,
  ) {
    return this.cart.updateQuantity(auth.userId, params.productId, dto.quantity);
  }

  @Delete('items/:productId')
  @ApiOkResponse({ type: CartResponseDto })
  remove(@CurrentAuth() auth: Identity, @Param() params: CartProductParamsDto) {
    return this.cart.removeItem(auth.userId, params.productId);
  }

  @Delete('items')
  @ApiOkResponse({ type: CartResponseDto })
  clear(@CurrentAuth() auth: Identity) {
    return this.cart.clear(auth.userId);
  }
}
