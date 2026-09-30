import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiErrorResponseDto } from '../auth/dto';
import { AuthenticatedRequest, CurrentAuth } from '../auth/session.guard';
import {
  AddListItemDto,
  ListDetailsDto,
  ListItemParamsDto,
  ListNameDto,
  ListParamsDto,
  ListSummaryDto,
} from './dto';
import { LISTS_API, ListsApi } from './lists.api';

type Identity = NonNullable<AuthenticatedRequest['auth']>;

@ApiTags('lists')
@ApiCookieAuth()
@ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
@ApiBadRequestResponse({ type: ApiErrorResponseDto })
@ApiNotFoundResponse({ type: ApiErrorResponseDto })
@Controller('lists')
export class ListsController {
  constructor(@Inject(LISTS_API) private readonly lists: ListsApi) {}

  @Get()
  @Header('Cache-Control', 'private, no-store')
  @ApiOperation({ summary: 'Your lists; the default "Lista de desejos" is created on first use' })
  @ApiOkResponse({ type: [ListSummaryDto] })
  list(@CurrentAuth() auth: Identity) {
    return this.lists.getLists(auth.userId);
  }

  @Post()
  @ApiCreatedResponse({ type: ListSummaryDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto, description: 'Too many lists' })
  create(@CurrentAuth() auth: Identity, @Body() dto: ListNameDto) {
    return this.lists.createList(auth.userId, dto.name);
  }

  @Get(':listId')
  @Header('Cache-Control', 'private, no-store')
  @ApiOkResponse({ type: ListDetailsDto })
  get(@CurrentAuth() auth: Identity, @Param() params: ListParamsDto) {
    return this.lists.getList(auth.userId, params.listId);
  }

  @Patch(':listId')
  @ApiOkResponse({ type: ListSummaryDto })
  rename(@CurrentAuth() auth: Identity, @Param() params: ListParamsDto, @Body() dto: ListNameDto) {
    return this.lists.renameList(auth.userId, params.listId, dto.name);
  }

  @Delete(':listId')
  @HttpCode(204)
  @ApiNoContentResponse()
  @ApiConflictResponse({ type: ApiErrorResponseDto, description: 'The default list is protected' })
  async remove(@CurrentAuth() auth: Identity, @Param() params: ListParamsDto) {
    await this.lists.deleteList(auth.userId, params.listId);
  }

  @Post(':listId/items')
  @HttpCode(200)
  @ApiOperation({ summary: 'Add a product (idempotent)' })
  @ApiOkResponse({ type: ListDetailsDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto, description: 'List is full' })
  addItem(
    @CurrentAuth() auth: Identity,
    @Param() params: ListParamsDto,
    @Body() dto: AddListItemDto,
  ) {
    return this.lists.addItem(auth.userId, params.listId, dto.productId);
  }

  @Delete(':listId/items/:productId')
  @ApiOkResponse({ type: ListDetailsDto })
  removeItem(@CurrentAuth() auth: Identity, @Param() params: ListItemParamsDto) {
    return this.lists.removeItem(auth.userId, params.listId, params.productId);
  }
}
