import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length, MaxLength, MinLength } from 'class-validator';
import {
  ChangeEmailRequest,
  ChangePasswordRequest,
  ChangePasswordResponse,
  DISPLAY_NAME_MAX_LENGTH,
  DISPLAY_NAME_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  UpdateProfileRequest,
} from '@amazon-mvp/api-contract';

/** Same rules as RegisterDto: account data can never be edited into a state
 * that registration would have rejected. */
export class UpdateProfileDto implements UpdateProfileRequest {
  @ApiProperty({
    example: 'Ada Lovelace',
    minLength: DISPLAY_NAME_MIN_LENGTH,
    maxLength: DISPLAY_NAME_MAX_LENGTH,
  })
  @IsString()
  @Length(DISPLAY_NAME_MIN_LENGTH, DISPLAY_NAME_MAX_LENGTH)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  displayName: string;
}

export class ChangePasswordDto implements ChangePasswordRequest {
  @ApiProperty({ example: 'correct horse battery staple' })
  @IsString()
  @MaxLength(PASSWORD_MAX_LENGTH)
  currentPassword: string;

  @ApiProperty({
    example: 'a different long passphrase',
    minLength: PASSWORD_MIN_LENGTH,
    maxLength: PASSWORD_MAX_LENGTH,
  })
  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH, {
    message: `newPassword must be at least ${PASSWORD_MIN_LENGTH} characters`,
  })
  @MaxLength(PASSWORD_MAX_LENGTH)
  newPassword: string;
}

export class ChangePasswordResponseDto implements ChangePasswordResponse {
  @ApiProperty({ example: true }) success: true;
  @ApiProperty({ type: 'integer', description: 'Other sessions that were signed out' })
  revokedSessions: number;
}

export class ChangeEmailDto implements ChangeEmailRequest {
  @ApiProperty({ example: 'ada@example.com', maxLength: 254 })
  @IsEmail({}, { message: 'email must be a valid email address' })
  @MaxLength(254)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email: string;

  @ApiProperty({ example: 'correct horse battery staple' })
  @IsString()
  @MaxLength(PASSWORD_MAX_LENGTH)
  currentPassword: string;
}
