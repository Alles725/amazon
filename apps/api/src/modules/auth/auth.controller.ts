import { Body, Controller, Get, HttpCode, Inject, Post, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiConfig } from '@amazon-mvp/config-schema';
import { CookieOptions, Response } from 'express';
import { API_CONFIG } from '../../config/api-config';
import { AuthService } from './auth.service';
import {
  ApiErrorResponseDto,
  LoginDto,
  LogoutResponseDto,
  RegisterDto,
  SessionResponseDto,
} from './dto';
import { IssuedSession } from './sessions.api';
import { AuthenticatedRequest, CurrentAuth, Public } from './session.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    @Inject(API_CONFIG) private readonly config: ApiConfig,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create an account and start a session' })
  @ApiResponse({ status: 201, type: SessionResponseDto })
  @ApiResponse({ status: 409, type: ApiErrorResponseDto, description: 'Email already registered' })
  async register(
    @Body() dto: RegisterDto,
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<SessionResponseDto> {
    const result = await this.auth.register(dto, metaFrom(request));
    this.setSessionCookie(response, result.session);
    return { user: result.profile, expiresAt: result.session.expiresAt.toISOString() };
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Exchange credentials for a session cookie' })
  @ApiResponse({ status: 200, type: SessionResponseDto })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Invalid credentials' })
  async login(
    @Body() dto: LoginDto,
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<SessionResponseDto> {
    const result = await this.auth.login(dto, metaFrom(request));
    this.setSessionCookie(response, result.session);
    return { user: result.profile, expiresAt: result.session.expiresAt.toISOString() };
  }

  @Public()
  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Invalidate the current session' })
  @ApiResponse({ status: 200, type: LogoutResponseDto })
  async logout(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LogoutResponseDto> {
    await this.auth.logout(request.cookies?.[this.config.session.cookieName]);
    response.clearCookie(this.config.session.cookieName, this.cookieOptions(0));
    return { success: true };
  }

  @Get('me')
  @ApiOperation({ summary: 'Return the signed-in user' })
  @ApiResponse({ status: 200, type: SessionResponseDto })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'No valid session' })
  async me(@CurrentAuth() auth: NonNullable<AuthenticatedRequest['auth']>) {
    return this.auth.currentSession(auth.userId, auth.expiresAt);
  }

  private setSessionCookie(response: Response, session: IssuedSession) {
    response.cookie(
      this.config.session.cookieName,
      session.token,
      this.cookieOptions(session.expiresAt.getTime() - Date.now()),
    );
  }

  private cookieOptions(maxAgeMs: number): CookieOptions {
    return {
      httpOnly: true, // never readable by JavaScript
      secure: this.config.session.secureCookie, // false only for plain-HTTP local dev
      sameSite: this.config.session.sameSite,
      path: '/',
      maxAge: maxAgeMs,
    };
  }
}

function metaFrom(request: AuthenticatedRequest) {
  return { userAgent: request.header('user-agent'), ipAddress: request.ip };
}
