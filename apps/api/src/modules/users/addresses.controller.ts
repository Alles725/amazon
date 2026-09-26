import { Body, Controller, Get, Header, Inject, Param, Post, Put } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { CurrentAuth, AuthenticatedRequest } from '../auth/session.guard';
import { USER_ADDRESSES_API, UserAddressesApi } from './users.api';
import { AddressInputDto, AddressParamsDto, SavedAddressDto } from './address.dto';
type Identity = NonNullable<AuthenticatedRequest['auth']>;
@ApiTags('addresses')
@ApiCookieAuth()
@Controller('addresses')
export class AddressesController {
  constructor(@Inject(USER_ADDRESSES_API) private readonly users: UserAddressesApi) {}
  @Get()
  @Header('Cache-Control', 'private, no-store')
  @ApiOkResponse({ type: [SavedAddressDto] })
  list(@CurrentAuth() auth: Identity) {
    return this.users.listAddresses(auth.userId);
  }
  @Post()
  @ApiCreatedResponse({ type: SavedAddressDto })
  create(@CurrentAuth() auth: Identity, @Body() dto: AddressInputDto) {
    return this.users.saveAddress(auth.userId, dto);
  }
  @Put(':addressId')
  @ApiOkResponse({ type: SavedAddressDto })
  update(
    @CurrentAuth() auth: Identity,
    @Param() params: AddressParamsDto,
    @Body() dto: AddressInputDto,
  ) {
    return this.users.saveAddress(auth.userId, dto, params.addressId);
  }
}
