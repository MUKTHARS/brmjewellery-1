const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;