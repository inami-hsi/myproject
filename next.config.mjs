/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // 本番環境でのパフォーマンス最適化
  poweredByHeader: false,
  compress: true,
  
  // 画像最適化
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  
  // 実験的機能
  experimental: {
    // サーバーコンポーネントの最適化
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  
  // 環境変数（ビルド時に埋め込み）
  env: {
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
  
  // ログ設定
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
};

export default nextConfig;
