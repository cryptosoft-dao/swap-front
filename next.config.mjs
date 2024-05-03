/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cryptologos.cc",
        port: "",
        pathname: "/*",
      },
      {
        protocol: "https",
        hostname: "asset.ston.fi",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "assets.dedust.io",
        port: "",
        pathname: "/**",
      },
    ],
    dangerouslyAllowSVG: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
