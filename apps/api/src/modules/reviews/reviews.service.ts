import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  HelpfulVoteResponse,
  OwnReviewResponse,
  ProductRatingSummaries,
  RatingSummary,
  ReviewErrorCode,
  ReviewPage,
  ReviewResponse,
  ReviewSort,
  ReviewViewerState,
  SaveReviewRequest,
} from '@amazon-mvp/api-contract';
import { Prisma } from '@amazon-mvp/database';
import { ApiError } from '../../common/api-error';
import { PrismaService } from '../../common/prisma.service';
import { CATALOG_API, CatalogApi } from '../catalog/catalog.api';
import { ORDERS_API, OrdersApi } from '../orders/orders.api';
import { USERS_API, UsersApi } from '../users/users.api';
import { publicName, summarize } from './review-rules';
import { ReviewsApi } from './reviews.api';

type StoredReview = Prisma.ReviewGetPayload<object>;

const unique = (ids: string[]) => [...new Set(ids)];

@Injectable()
export class ReviewsService implements ReviewsApi {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CATALOG_API) private readonly catalog: CatalogApi,
    @Inject(ORDERS_API) private readonly orders: OrdersApi,
    @Inject(USERS_API) private readonly users: UsersApi,
  ) {}

  async list(query: {
    productIds: string[];
    sort: ReviewSort;
    stars?: number;
    page: number;
    pageSize: number;
  }): Promise<ReviewPage> {
    const where: Prisma.ReviewWhereInput = {
      productId: { in: unique(query.productIds) },
      ...(query.stars ? { rating: query.stars } : {}),
    };
    // The id tie-breaker keeps pagination stable between requests.
    const orderBy: Prisma.ReviewOrderByWithRelationInput[] =
      query.sort === 'recent'
        ? [{ createdAt: 'desc' }, { id: 'asc' }]
        : [{ helpfulCount: 'desc' }, { createdAt: 'desc' }, { id: 'asc' }];
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.review.count({ where }),
    ]);
    return { items: rows.map(reviewView), total, page: query.page, pageSize: query.pageSize };
  }

  async summary(productIds: string[]): Promise<RatingSummary> {
    const ids = unique(productIds);
    const [baselines, stars] = await Promise.all([
      this.prisma.reviewRatingBaseline.findMany({
        where: { productId: { in: ids } },
        orderBy: { productId: 'asc' },
      }),
      this.prisma.review.groupBy({
        by: ['rating'],
        where: { productId: { in: ids } },
        _count: { _all: true },
      }),
    ]);
    return summarize(
      baselines,
      stars.map((row) => ({ rating: row.rating, count: row._count._all })),
    );
  }

  async summaries(productIds: string[]): Promise<ProductRatingSummaries> {
    const ids = unique(productIds);
    const [baselines, stars] = await Promise.all([
      this.prisma.reviewRatingBaseline.findMany({ where: { productId: { in: ids } } }),
      this.prisma.review.groupBy({
        by: ['productId', 'rating'],
        where: { productId: { in: ids } },
        _count: { _all: true },
      }),
    ]);
    return {
      items: ids.map((productId) => {
        const { average, count } = summarize(
          baselines.filter((row) => row.productId === productId),
          stars
            .filter((row) => row.productId === productId)
            .map((row) => ({ rating: row.rating, count: row._count._all })),
        );
        return { productId, average, count };
      }),
    };
  }

  async viewerState(userId: string, productIds: string[]): Promise<ReviewViewerState> {
    const ids = unique(productIds);
    const [own, votes] = await Promise.all([
      this.prisma.review.findMany({
        where: { userId, productId: { in: ids } },
        select: { id: true, productId: true },
      }),
      this.prisma.reviewHelpfulVote.findMany({
        where: { userId, review: { productId: { in: ids } } },
        select: { reviewId: true },
      }),
    ]);
    return { ownReviews: own, helpfulReviewIds: votes.map((vote) => vote.reviewId) };
  }

  async findOwn(userId: string, productId: string): Promise<OwnReviewResponse | null> {
    if (!(await this.productExists(productId))) return null;
    const [review, verifiedPurchase] = await Promise.all([
      this.prisma.review.findUnique({ where: { productId_userId: { productId, userId } } }),
      this.orders.hasPurchased(userId, productId),
    ]);
    return { review: review ? reviewView(review) : null, verifiedPurchase };
  }

  async saveOwn(userId: string, input: SaveReviewRequest): Promise<ReviewResponse> {
    if (!(await this.productExists(input.productId))) throw ApiError.notFound('Product');
    const [user, verifiedPurchase] = await Promise.all([
      this.users.findById(userId),
      this.orders.hasPurchased(userId, input.productId),
    ]);
    if (!user) throw ApiError.sessionRequired();
    const data = {
      authorName: publicName(user.displayName),
      rating: input.rating,
      title: input.title,
      body: input.body,
      verifiedPurchase,
    };
    const where = { productId_userId: { productId: input.productId, userId } };
    try {
      return reviewView(
        await this.prisma.review.upsert({
          where,
          update: data,
          create: { ...data, productId: input.productId, userId },
        }),
      );
    } catch (error) {
      // Two concurrent first saves: the loser updates the row the winner created.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
        return reviewView(await this.prisma.review.update({ where, data }));
      throw error;
    }
  }

  async markHelpful(userId: string, reviewId: string): Promise<HelpfulVoteResponse> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: { userId: true },
    });
    if (!review) throw ApiError.notFound('Review');
    if (review.userId === userId)
      throw new HttpException(
        {
          code: ReviewErrorCode.REVIEW_SELF_VOTE,
          message: 'Você não pode marcar sua própria avaliação como útil.',
        },
        HttpStatus.FORBIDDEN,
      );
    return this.prisma.$transaction(async (tx) => {
      // One vote per user: a repeated click is a no-op that returns the same count.
      const { count } = await tx.reviewHelpfulVote.createMany({
        data: [{ reviewId, userId }],
        skipDuplicates: true,
      });
      const saved = count
        ? await tx.review.update({
            where: { id: reviewId },
            data: { helpfulCount: { increment: 1 } },
            select: { helpfulCount: true },
          })
        : await tx.review.findUniqueOrThrow({
            where: { id: reviewId },
            select: { helpfulCount: true },
          });
      return { reviewId, helpfulCount: saved.helpfulCount, voted: true as const };
    });
  }

  private async productExists(productId: string) {
    return (await this.catalog.findByIds([productId])).length > 0;
  }
}

function reviewView(review: StoredReview): ReviewResponse {
  return {
    id: review.id,
    productId: review.productId,
    authorName: review.authorName,
    rating: review.rating,
    title: review.title,
    body: review.body,
    verifiedPurchase: review.verifiedPurchase,
    helpfulCount: review.helpfulCount,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  };
}
