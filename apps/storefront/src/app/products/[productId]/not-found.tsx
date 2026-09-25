import Link from 'next/link';
export default function ProductNotFound() {
  return (
    <main className="az-detail-main az-detail-state">
      <h1>Produto não encontrado</h1>
      <p>Este produto não está disponível no catálogo.</p>
      <Link href="/">Voltar à página inicial</Link>
    </main>
  );
}
