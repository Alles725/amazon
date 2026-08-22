import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticatedRequest, CurrentAuth } from './session.guard';

/** Proves the guard works end-to-end from the storefront. */
@ApiTags('protected')
@Controller('protected')
export class ProtectedExampleController {
  @Get('example')
  @ApiOperation({ summary: 'Example endpoint that requires a session' })
  example(@CurrentAuth() auth: NonNullable<AuthenticatedRequest['auth']>) {
    return { message: 'You are authenticated', userId: auth.userId };
  }
}
