/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Library file uploads are limited to 5 MB in the app; leave headroom for form overhead.
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
};
export default nextConfig;
