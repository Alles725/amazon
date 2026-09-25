import { ReactNode } from 'react';
import { AmazonHeader } from '@/components/amazon/amazon-header';
import { AmazonFooter } from '@/components/amazon/amazon-footer';

export default function ProductLayout({ children }: { children: ReactNode }) {
  return (
    <div className="amazon-product-page" id="top">
      <AmazonHeader />
      {children}
      <AmazonFooter />
    </div>
  );
}
