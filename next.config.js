/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['openweathermap.org'],
  },
  // 프로덕션 환경에서의 소스맵 생성 비활성화
  productionBrowserSourceMaps: false,
  // 빌드 최적화
  compiler: {
    // Framer Motion 애니메이션 최적화
    styledComponents: true,
  },
  // 실험적 기능 활성화
  experimental: {
    appDir: true,
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    return config;
  },
};

module.exports = nextConfig; 