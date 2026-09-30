import { Body, Controller, HttpCode, Patch, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AccountService } from './account.service';
import {
  ChangeEmailDto,
  ChangePasswordDto,
  ChangePasswordResponseDto,
  UpdateProfileDto,
} from './account.dto';
import { ApiErrorResponseDto, UserProfileDto } from './dto';
import { AuthenticatedRequest, CurrentAuth } from './session.guard';

type Identity = NonNullable<AuthenticatedRequest['auth']>;

@ApiTags('account')
@ApiCookieAuth()
@ApiUnauthorizedResponse({ type: ApiErrorResponseDto, description: 'No valid session' })
@ApiBadRequestResponse({ type: ApiErrorResponseDto })
@Controller('account')
export class AccountController {
  constructor(private readonly account: AccountService) {}

  @Patch('profile')
  @ApiOperation({ summary: 'Change the display name of the signed-in account' })
  @ApiOkResponse({ type: UserProfileDto })
  updateProfile(@CurrentAuth() auth: Identity, @Body() dto: UpdateProfileDto) {
    return this.account.updateProfile(auth.userId, dto.displayName);
  }

  @Post('password')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Change the password; requires the current one and signs out other sessions',
  })
  @ApiOkResponse({ type: ChangePasswordResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto, description: 'Wrong current password' })
  changePassword(@CurrentAuth() auth: Identity, @Body() dto: ChangePasswordDto) {
    return this.account.changePassword(auth, dto.currentPassword, dto.newPassword);
  }

  @Post('email')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Change the sign-in e-mail; requires the current password and signs out other sessions',
  })
  @ApiOkResponse({ type: UserProfileDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto, description: 'Wrong current password' })
  @ApiConflictResponse({ type: ApiErrorResponseDto, description: 'Email already registered' })
  changeEmail(@CurrentAuth() auth: Identity, @Body() dto: ChangeEmailDto) {
    return this.account.changeEmail(auth, dto.email, dto.currentPassword);
  }
}
