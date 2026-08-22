'use client';

import { ErrorState } from '@/components/states';

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="page page--narrow">
      <ErrorState
        body="The page could not be rendered. Retry, or check the API and configuration if this keeps happening."
        action={
          <button className="button button--secondary" onClick={reset}>
            Retry
          </button>
        }
      />
    </main>
  );
}
