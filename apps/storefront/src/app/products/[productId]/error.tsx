'use client';
export default function ProductError({ reset }: { reset: () => void }) {
  return (
    <main className="az-detail-main az-detail-state">
      <h1>Não foi possível carregar o produto</h1>
      <p>Tente novamente em instantes.</p>
      <button type="button" className="az-detail-button" onClick={reset}>
        Tentar novamente
      </button>
    </main>
  );
}
