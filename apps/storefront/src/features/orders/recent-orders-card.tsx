import Link from 'next/link';
import { OrderResponse } from '@amazon-mvp/api-contract';
import { ProductImage } from '@/components/amazon/product-image';
import { deliveryStatus, distinctOrderedProducts, photoForSku } from './order-presentation';

/** Home collection card built from the user's persisted orders (never fixtures). */
export function RecentOrdersCard({ orders }: { orders: OrderResponse[] }) {
  const products = distinctOrderedProducts(orders).slice(0, 4);
  return (
    <section className="az-collection az-home-orders" aria-label="Seus pedidos">
      <div className="az-collection__head">
        <h2>Seus pedidos</h2>
        <Link href="/orders" aria-label="Ver seus pedidos">
          <span aria-hidden="true">›</span>
        </Link>
      </div>
      <ul
        className={`az-home-orders__grid az-home-orders__grid--${products.length > 1 ? 'many' : 'one'}`}
      >
        {products.map(({ line, order }) => (
          <li key={line.productId}>
            <Link href={`/orders/${encodeURIComponent(order.id)}`} className="az-home-orders__item">
              <span className="az-home-orders__media">
                <ProductImage image={photoForSku(line.sku)} />
              </span>
              <span className="az-home-orders__name">{line.productName}</span>
              <span className="az-home-orders__status">{deliveryStatus(order).headline}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/orders" className="az-home-orders__all">
        Ver todos os pedidos
      </Link>
    </section>
  );
}
