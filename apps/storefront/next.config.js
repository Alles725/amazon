/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Only used outside Kubernetes. In-cluster the Ingress routes /api to the API,
  // so browser requests are same-origin and no rewrite is involved.
  async rewrites() {
    const target = process.env.API_INTERNAL_URL;
    if (!target || process.env.DISABLE_API_REWRITE === 'true') return [];
    return [{ source: '/api/:path*', destination: `${target}/api/:path*` }];
  },
};

module.exports = nextConfig;
