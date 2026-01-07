/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable turbopack to avoid serialization issues
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
