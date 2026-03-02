/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // 本番環境でのパフォーマンス最適化
  poweredByHeader: false,
  
  // 画像最適化
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  
  // 実験的機能
  experimental: {
    // サーバーコンポーネントの最適化
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
};

export default nextConfig;
