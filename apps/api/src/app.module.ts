import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggingModule } from './common/logging.module';
import { PrismaModule } from './common/prisma.module';
import { RequestIdMiddleware } from './common/request-id.middleware';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './modules/auth/auth.module';
import { CartModule } from './modules/cart/cart.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { HealthModule } from './modules/health/health.module';
import { OrdersModule } from './modules/orders/orders.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule,
    LoggingModule,
    PrismaModule,
    HealthModule,
    UsersModule,
    AuthModule,
    CatalogModule,
    CartModule,
    OrdersModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
