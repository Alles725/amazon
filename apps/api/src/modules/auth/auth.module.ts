import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';
import { ProtectedExampleController } from './protected-example.controller';
import { SessionService } from './session.service';
import { SESSIONS_API } from './sessions.api';
import { SessionGuard } from './session.guard';

/**
 * SessionGuard is registered globally: routes are protected by default and must
 * opt out with @Public(). Fail-closed beats remembering to add a decorator.
 */
@Module({
  imports: [UsersModule],
  controllers: [AuthController, ProtectedExampleController],
  providers: [
    AuthService,
    PasswordService,
    SessionService,
    { provide: SESSIONS_API, useExisting: SessionService },
    { provide: APP_GUARD, useClass: SessionGuard },
  ],
  exports: [SESSIONS_API, SessionService],
})
export class AuthModule {}
