/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'prisma'],
  experimental: {
    workerThreads: false,
    cpus: 1
  }
};

export default nextConfig;
