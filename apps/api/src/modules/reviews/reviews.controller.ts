import { Body, Controller, Get, Header, Inject, Param, Put, Query } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiError } from '../../common/api-error';
import { AuthenticatedRequest, CurrentAuth, Public } from '../auth/session.guard';
import { REVIEWS_API, ReviewsApi } from './reviews.api';
import {
  HelpfulVoteDto,
  OwnReviewDto,
  OwnReviewQueryDto,
  ProductRatingSummariesDto,
  RatingSummaryDto,
  ReviewDto,
  ReviewListQueryDto,
  ReviewPageDto,
  ReviewParamsDto,
  ReviewProductsQueryDto,
  ReviewSummariesQueryDto,
  ReviewViewerStateDto,
  SaveReviewDto,
} from './dto';

type Identity = NonNullable<AuthenticatedRequest['auth']>;

/** Reading reviews is public; writing, voting and viewer state need a session
 * (the global SessionGuard). */
@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(@Inject(REVIEWS_API) private readonly reviews: ReviewsApi) {}

  @Public()
  @Get()
  @Header('Cache-Control', 'no-store')
  @ApiOkResponse({ type: ReviewPageDto })
  list(@Query() query: ReviewListQueryDto): Promise<ReviewPageDto> {
    return this.reviews.list({
      productIds: query.productIds,
      sort: query.sort ?? 'helpful',
      stars: query.stars,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
    });
  }

  @Public()
  @Get('summary')
  @Header('Cache-Control', 'no-store')
  @ApiOkResponse({ type: RatingSummaryDto })
  summary(@Query() query: ReviewProductsQueryDto): Promise<RatingSummaryDto> {
    return this.reviews.summary(query.productIds);
  }

  @Public()
  @Get('summaries')
  @Header('Cache-Control', 'no-store')
  @ApiOkResponse({ type: ProductRatingSummariesDto })
  summaries(@Query() query: ReviewSummariesQueryDto): Promise<ProductRatingSummariesDto> {
    return this.reviews.summaries(query.productIds);
  }

  @Get('viewer')
  @ApiCookieAuth()
  @Header('Cache-Control', 'private, no-store')
  @ApiOkResponse({ type: ReviewViewerStateDto })
  viewer(@CurrentAuth() auth: Identity, @Query() query: ReviewProductsQueryDto) {
    return this.reviews.viewerState(auth.userId, query.productIds);
  }

  @Get('mine')
  @ApiCookieAuth()
  @Header('Cache-Control', 'private, no-store')
  @ApiOkResponse({ type: OwnReviewDto })
  @ApiNotFoundResponse({ description: 'Product not found' })
  async mine(@CurrentAuth() auth: Identity, @Query() query: OwnReviewQueryDto) {
    const own = await this.reviews.findOwn(auth.userId, query.productId);
    if (!own) throw ApiError.notFound('Product');
    return own;
  }

  /** Creates the caller's review of the product or updates the existing one. */
  @Put('mine')
  @ApiCookieAuth()
  @ApiOkResponse({ type: ReviewDto })
  @ApiNotFoundResponse({ description: 'Product not found' })
  save(@CurrentAuth() auth: Identity, @Body() dto: SaveReviewDto) {
    return this.reviews.saveOwn(auth.userId, dto);
  }

  /** Idempotent: voting twice keeps one vote. */
  @Put(':reviewId/helpful')
  @ApiCookieAuth()
  @ApiOkResponse({ type: HelpfulVoteDto })
  @ApiNotFoundResponse({ description: 'Review not found' })
  @ApiForbiddenResponse({ description: 'REVIEW_SELF_VOTE: own review' })
  helpful(@CurrentAuth() auth: Identity, @Param() params: ReviewParamsDto) {
    return this.reviews.markHelpful(auth.userId, params.reviewId);
  }
}
