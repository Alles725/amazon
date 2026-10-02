import { AddressesController } from './addresses.controller';
import { Module } from '@nestjs/common';
import { PaymentCardsController } from './payment-cards.controller';
import { PaymentCardsRepository } from './payment-cards.repository';
import { USERS_API, USER_ADDRESSES_API, USER_PAYMENT_CARDS_API } from './users.api';
import { UsersRepository } from './users.repository';

@Module({
  controllers: [AddressesController, PaymentCardsController],
  providers: [
    UsersRepository,
    PaymentCardsRepository,
    { provide: USERS_API, useExisting: UsersRepository },
    { provide: USER_ADDRESSES_API, useExisting: UsersRepository },
    { provide: USER_PAYMENT_CARDS_API, useExisting: PaymentCardsRepository },
  ],
  exports: [USERS_API, USER_ADDRESSES_API, USER_PAYMENT_CARDS_API],
})
export class UsersModule {}
