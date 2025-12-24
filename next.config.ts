 /** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'http://192.168.21.245:9999/api/:path*',
      },
    ];
  },
};
export default nextConfig;