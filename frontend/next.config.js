/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, 
  transpilePackages: ['@mui/x-charts'],
  async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: true,
      },
    ]
  },
}
module.exports = nextConfig
