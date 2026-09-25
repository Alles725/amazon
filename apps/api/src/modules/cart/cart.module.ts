import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { CART_API } from './cart.api';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  imports: [CatalogModule],
  controllers: [CartController],
  providers: [CartService, { provide: CART_API, useExisting: CartService }],
  exports: [CART_API],
})
export class CartModule {}
