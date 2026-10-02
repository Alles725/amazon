import { Body, Controller, Delete, Get, Header, Inject, Param, Post } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiErrorResponseDto } from '../auth/dto';
import { CurrentAuth, AuthenticatedRequest } from '../auth/session.guard';
import { USER_PAYMENT_CARDS_API, UserPaymentCardsApi } from './users.api';
import { PaymentCardInputDto, PaymentCardParamsDto, SavedPaymentCardDto } from './payment-card.dto';
type Identity = NonNullable<AuthenticatedRequest['auth']>;
@ApiTags('payment-cards')
@ApiCookieAuth()
@Controller('payment-cards')
export class PaymentCardsController {
  constructor(@Inject(USER_PAYMENT_CARDS_API) private readonly cards: UserPaymentCardsApi) {}
  @Get()
  @Header('Cache-Control', 'private, no-store')
  @ApiOkResponse({ type: [SavedPaymentCardDto] })
  list(@CurrentAuth() auth: Identity) {
    return this.cards.listCards(auth.userId);
  }
  @Post()
  @ApiOperation({
    summary: 'Save a simulated card (brand, last four digits, holder, expiry; never the number)',
  })
  @ApiCreatedResponse({ type: SavedPaymentCardDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  create(@CurrentAuth() auth: Identity, @Body() dto: PaymentCardInputDto) {
    return this.cards.addCard(auth.userId, dto);
  }
  @Delete(':cardId')
  @ApiOperation({ summary: 'Remove a saved card; returns the remaining cards' })
  @ApiOkResponse({ type: [SavedPaymentCardDto] })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  remove(@CurrentAuth() auth: Identity, @Param() params: PaymentCardParamsDto) {
    return this.cards.deleteCard(auth.userId, params.cardId);
  }
}
