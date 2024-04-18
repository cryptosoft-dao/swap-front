/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["cryptologos.cc", "asset.ston.fi"],
    dangerouslyAllowSVG: true,
  },
  reactStrictMode:false
};

export default nextConfig;
