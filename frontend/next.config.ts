/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**', // This allows all paths under this domain
      },
    ],
  },
  // ... other configurations
};

module.exports = nextConfig;