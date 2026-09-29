import localFont from 'next/font/local';

// Same Amazon Ember stand-in as /sell and /help (see features/sell/fonts/OFL.txt).
export const ordersFont = localFont({
  src: '../sell/fonts/inter-tight-latin-wght.woff2',
  weight: '100 900',
  variable: '--font-orders',
  display: 'swap',
});
