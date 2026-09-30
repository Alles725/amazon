import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';
import {
  HelpfulVoteResponse,
  OwnReviewResponse,
  ProductRatingSummaries,
  ProductRatingSummary,
  RatingBucket,
  RatingSummary,
  REVIEW_LIMITS,
  ReviewPage,
  ReviewResponse,
  ReviewSort,
  ReviewViewerState,
  SaveReviewRequest,
} from '@amazon-mvp/api-contract';

const commaSeparated = ({ value }: { value: unknown }) =>
  typeof value === 'string'
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : value;
const trimmed = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class ReviewProductsQueryDto {
  @ApiProperty({
    description: `Comma-separated product UUIDs (at most ${REVIEW_LIMITS.productIdsMax}), e.g. a variant family`,
    type: String,
  })
  @Transform(commaSeparated)
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(REVIEW_LIMITS.productIdsMax)
  @IsUUID('all', { each: true })
  productIds: string[];
}

export class ReviewListQueryDto extends ReviewProductsQueryDto {
  @ApiPropertyOptional({ enum: ['helpful', 'recent'], default: 'helpful' })
  @IsOptional()
  @IsIn(['helpful', 'recent'])
  sort?: ReviewSort;
  @ApiPropertyOptional({ minimum: 1, maximum: 5, description: 'Only reviews with this rating' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  stars?: number;
  @ApiPropertyOptional({ minimum: 1, maximum: 1000, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  page?: number;
  @ApiPropertyOptional({ minimum: 1, maximum: REVIEW_LIMITS.pageSizeMax, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(REVIEW_LIMITS.pageSizeMax)
  pageSize?: number;
}

export class ReviewSummariesQueryDto {
  @ApiProperty({
    description: `Comma-separated product UUIDs (at most ${REVIEW_LIMITS.summariesMax})`,
    type: String,
  })
  @Transform(commaSeparated)
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(REVIEW_LIMITS.summariesMax)
  @IsUUID('all', { each: true })
  productIds: string[];
}

export class OwnReviewQueryDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() productId: string;
}

export class SaveReviewDto implements SaveReviewRequest {
  @ApiProperty({ format: 'uuid' }) @IsUUID() productId: string;
  @ApiProperty({ type: 'integer', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;
  @ApiProperty({ minLength: REVIEW_LIMITS.titleMin, maxLength: REVIEW_LIMITS.titleMax })
  @Transform(trimmed)
  @IsString()
  @Length(REVIEW_LIMITS.titleMin, REVIEW_LIMITS.titleMax)
  title: string;
  @ApiProperty({ minLength: REVIEW_LIMITS.bodyMin, maxLength: REVIEW_LIMITS.bodyMax })
  @Transform(trimmed)
  @IsString()
  @Length(REVIEW_LIMITS.bodyMin, REVIEW_LIMITS.bodyMax)
  body: string;
}

export class ReviewParamsDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() reviewId: string;
}

export class ReviewDto implements ReviewResponse {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ format: 'uuid' }) productId: string;
  @ApiProperty() authorName: string;
  @ApiProperty({ type: 'integer', minimum: 1, maximum: 5 }) rating: number;
  @ApiProperty() title: string;
  @ApiProperty() body: string;
  @ApiProperty() verifiedPurchase: boolean;
  @ApiProperty({ type: 'integer', minimum: 0 }) helpfulCount: number;
  @ApiProperty() createdAt: string;
  @ApiProperty() updatedAt: string;
}

export class ReviewPageDto implements ReviewPage {
  @ApiProperty({ type: [ReviewDto] }) items: ReviewDto[];
  @ApiProperty({ type: 'integer' }) total: number;
  @ApiProperty({ type: 'integer' }) page: number;
  @ApiProperty({ type: 'integer' }) pageSize: number;
}

export class RatingBucketDto implements RatingBucket {
  @ApiProperty({ type: 'integer', minimum: 1, maximum: 5 }) stars: number;
  @ApiProperty({ type: 'integer', minimum: 0, maximum: 100 }) percent: number;
}

export class RatingSummaryDto implements RatingSummary {
  @ApiProperty({ type: Number, nullable: true, example: 4.6 }) average: number | null;
  @ApiProperty({ type: 'integer' }) count: number;
  @ApiProperty({
    type: [RatingBucketDto],
    nullable: true,
    description: '5 stars first; null when part of the aggregate has no known distribution',
  })
  distribution: RatingBucketDto[] | null;
}

export class ProductRatingSummaryDto implements ProductRatingSummary {
  @ApiProperty({ format: 'uuid' }) productId: string;
  @ApiProperty({ type: Number, nullable: true }) average: number | null;
  @ApiProperty({ type: 'integer' }) count: number;
}

export class ProductRatingSummariesDto implements ProductRatingSummaries {
  @ApiProperty({ type: [ProductRatingSummaryDto] }) items: ProductRatingSummaryDto[];
}

export class OwnReviewDto implements OwnReviewResponse {
  @ApiProperty({ type: ReviewDto, nullable: true }) review: ReviewDto | null;
  @ApiProperty() verifiedPurchase: boolean;
}

export class OwnReviewRefDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ format: 'uuid' }) productId: string;
}

export class ReviewViewerStateDto implements ReviewViewerState {
  @ApiProperty({ type: [OwnReviewRefDto] }) ownReviews: OwnReviewRefDto[];
  @ApiProperty({ type: [String] }) helpfulReviewIds: string[];
}

export class HelpfulVoteDto implements HelpfulVoteResponse {
  @ApiProperty({ format: 'uuid' }) reviewId: string;
  @ApiProperty({ type: 'integer' }) helpfulCount: number;
  @ApiProperty({ enum: [true] }) voted: true;
}
