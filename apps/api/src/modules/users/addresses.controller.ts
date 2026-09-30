import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Inject,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiErrorResponseDto } from '../auth/dto';
import { CurrentAuth, AuthenticatedRequest } from '../auth/session.guard';
import { USER_ADDRESSES_API, UserAddressesApi } from './users.api';
import { AccountAddressDto, AddressInputDto, AddressParamsDto } from './address.dto';
type Identity = NonNullable<AuthenticatedRequest['auth']>;
@ApiTags('addresses')
@ApiCookieAuth()
@Controller('addresses')
export class AddressesController {
  constructor(@Inject(USER_ADDRESSES_API) private readonly users: UserAddressesApi) {}
  @Get()
  @Header('Cache-Control', 'private, no-store')
  @ApiOkResponse({ type: [AccountAddressDto] })
  list(@CurrentAuth() auth: Identity) {
    return this.users.listAddresses(auth.userId);
  }
  @Post()
  @ApiCreatedResponse({ type: AccountAddressDto })
  create(@CurrentAuth() auth: Identity, @Body() dto: AddressInputDto) {
    return this.users.saveAddress(auth.userId, dto);
  }
  @Put(':addressId')
  @ApiOkResponse({ type: AccountAddressDto })
  update(
    @CurrentAuth() auth: Identity,
    @Param() params: AddressParamsDto,
    @Body() dto: AddressInputDto,
  ) {
    return this.users.saveAddress(auth.userId, dto, params.addressId);
  }
  @Delete(':addressId')
  @ApiOperation({ summary: 'Remove a saved address; returns the remaining addresses' })
  @ApiOkResponse({ type: [AccountAddressDto] })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  remove(@CurrentAuth() auth: Identity, @Param() params: AddressParamsDto) {
    return this.users.deleteAddress(auth.userId, params.addressId);
  }
  @Post(':addressId/default')
  @HttpCode(200)
  @ApiOperation({ summary: 'Make this the default address; returns every address' })
  @ApiOkResponse({ type: [AccountAddressDto] })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  setDefault(@CurrentAuth() auth: Identity, @Param() params: AddressParamsDto) {
    return this.users.setDefaultAddress(auth.userId, params.addressId);
  }
}
