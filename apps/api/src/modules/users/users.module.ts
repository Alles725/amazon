import { AddressesController } from './addresses.controller';
import { Module } from '@nestjs/common';
import { USERS_API, USER_ADDRESSES_API } from './users.api';
import { UsersRepository } from './users.repository';

@Module({
  controllers: [AddressesController],
  providers: [
    UsersRepository,
    { provide: USERS_API, useExisting: UsersRepository },
    { provide: USER_ADDRESSES_API, useExisting: UsersRepository },
  ],
  exports: [USERS_API, USER_ADDRESSES_API],
})
export class UsersModule {}
