'use client';
export default function CheckoutError({ reset }: { reset: () => void }) {
  return (
    <main className="page">
      <h1>Não foi possível carregar esta página</h1>
      <p>Tente novamente para consultar os dados salvos.</p>
      <button onClick={reset}>Tentar novamente</button>
    </main>
  );
}
