import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @ApiProperty({ example: 'ada@example.com', maxLength: 254 })
  @IsEmail({}, { message: 'email must be a valid email address' })
  @MaxLength(254)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email: string;

  @ApiProperty({ example: 'correct horse battery staple', minLength: 12, maxLength: 128 })
  @IsString()
  @MinLength(12, { message: 'password must be at least 12 characters' })
  @MaxLength(128)
  password: string;

  @ApiProperty({ example: 'Ada Lovelace', minLength: 2, maxLength: 80 })
  @IsString()
  @Length(2, 80)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  displayName: string;
}

export class LoginDto {
  @ApiProperty({ example: 'ada@example.com' })
  @IsEmail({}, { message: 'email must be a valid email address' })
  @MaxLength(254)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email: string;

  @ApiProperty({ example: 'correct horse battery staple' })
  @IsString()
  @MaxLength(128)
  password: string;
}

export class IdentifyDto {
  @ApiProperty({ example: 'ada@example.com' })
  @IsEmail({}, { message: 'email must be a valid email address' })
  @MaxLength(254)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email: string;
}

export class IdentifyResponseDto {
  @ApiProperty({ example: true }) exists: boolean;
}

export class UserProfileDto {
  @ApiProperty() id: string;
  @ApiProperty() email: string;
  @ApiProperty() displayName: string;
  @ApiProperty({ format: 'date-time' }) createdAt: string;
}

export class SessionResponseDto {
  @ApiProperty({ type: UserProfileDto }) user: UserProfileDto;
  @ApiProperty({ format: 'date-time' }) expiresAt: string;
}

export class LogoutResponseDto {
  @ApiProperty({ example: true }) success: true;
}

export class ApiErrorDetailDto {
  @ApiProperty({ example: 'AUTH_INVALID_CREDENTIALS' }) code: string;
  @ApiProperty({ example: 'Invalid credentials' }) message: string;
  @ApiProperty({ example: '3f1a...' }) requestId: string;
}

export class ApiErrorResponseDto {
  @ApiProperty({ type: ApiErrorDetailDto }) error: ApiErrorDetailDto;
}
