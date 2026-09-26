import { Module } from '@nestjs/common';
import { CartModule } from '../cart/cart.module';
import { CatalogModule } from '../catalog/catalog.module';
import { UsersModule } from '../users/users.module';
import { ORDERS_API } from './orders.api';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
@Module({
  imports: [CartModule, CatalogModule, UsersModule],
  controllers: [OrdersController],
  providers: [OrdersService, { provide: ORDERS_API, useExisting: OrdersService }],
  exports: [ORDERS_API],
})
export class OrdersModule {}
