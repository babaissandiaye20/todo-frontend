/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produces .next/standalone with a minimal server.js + only the node_modules needed at runtime.
  // Enables a small Docker image: copy .next/standalone instead of the whole project + node_modules.
  output: 'standalone',
  reactStrictMode: true,
};

export default nextConfig;
