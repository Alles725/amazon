import { Module } from '@nestjs/common';
import { USERS_API } from './users.api';
import { UsersRepository } from './users.repository';

@Module({
  providers: [UsersRepository, { provide: USERS_API, useExisting: UsersRepository }],
  exports: [USERS_API],
})
export class UsersModule {}
