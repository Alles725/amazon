import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { OrdersModule } from '../orders/orders.module';
import { UsersModule } from '../users/users.module';
import { REVIEWS_API } from './reviews.api';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [CatalogModule, OrdersModule, UsersModule],
  controllers: [ReviewsController],
  providers: [ReviewsService, { provide: REVIEWS_API, useExisting: ReviewsService }],
  exports: [REVIEWS_API],
})
export class ReviewsModule {}
