import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { FeatureRoute, isFeatureEnabled } from '@/config/feature-gate';
import { EmptyState } from '@/components/states';
import { getServerSession } from '@/features/auth/server-session';
import { productContent } from '@/features/product/product-content';
import { getCatalogProduct } from '@/features/product/product-server';
import { fetchOwnReview } from '@/features/product/reviews/product-reviews';
import { ReviewForm } from '@/features/product/reviews/review-form';
import '@/features/product/reviews/reviews.css';

type Params = { params: { productId: string } };

export const metadata: Metadata = {
  title: 'Escreva uma avaliação | Amazon.com.br',
  robots: { index: false },
};

/** Destination of "Escreva uma avaliação" / "Incluir avaliação": creates the
 * customer's review of this product or edits the one they already wrote. */
export default async function WriteReviewPage({ params }: Params) {
  if (!isFeatureEnabled('productReviews'))
    return (
      <FeatureRoute routeKey="productReviews" title="Escreva uma avaliação">
        {null}
      </FeatureRoute>
    );
  const product = await getCatalogProduct(params.productId);
  if (!product) notFound();
  const productHref = `/products/${encodeURIComponent(product.slug)}`;
  const loginHref = `/login?next=${encodeURIComponent(`${productHref}/review`)}`;
  if (!(await getServerSession())) redirect(loginHref);

  const own = await fetchOwnReview(product.id);
  if (own === 'signed-out') redirect(loginHref);
  if (own === 'not-found') notFound();
  const image = productContent(product).images[0];

  return (
    <main className="az-review-page">
      <h1>{own?.review ? 'Editar avaliação' : 'Criar avaliação'}</h1>
      <div className="az-review-page__product">
        {image && <Image src={image.src} alt={image.alt} width={64} height={64} />}
        <Link href={productHref}>{product.name}</Link>
      </div>
      {own === null ? (
        <EmptyState
          title="Não foi possível abrir sua avaliação"
          body="Não conseguimos falar com o serviço de avaliações agora. Tente novamente em instantes."
        />
      ) : (
        <>
          {own.verifiedPurchase && (
            <p className="az-review-page__verified">
              Você comprou este produto: sua avaliação terá o selo{' '}
              <strong>Compra verificada</strong>.
            </p>
          )}
          <ReviewForm
            productId={product.id}
            productHref={productHref}
            loginHref={loginHref}
            initial={
              own.review
                ? { rating: own.review.rating, title: own.review.title, body: own.review.body }
                : undefined
            }
          />
          <p className="az-review-page__note">
            Sua avaliação é publicada com seu primeiro nome e a inicial do sobrenome. Você pode
            editá-la quando quiser; cada cliente tem uma avaliação por produto.
          </p>
        </>
      )}
    </main>
  );
}
