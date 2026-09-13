/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  async rewrites() {
    return [
      {
        source: "/__/auth/:path*",
        destination: "https://forge-fitness-a426e.firebaseapp.com/__/auth/:path*"
      }
    ];
  },
  async headers() {
    return [
      {
        source: "/videos/:all*(mp4|webm)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable"
          },
          {
            key: "Accept-Ranges",
            value: "bytes"
          }
        ]
      },
      {
        source: "/illustrations/:all*(jpg|jpeg|png|webp)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        source: "/images/:all*(jpg|jpeg|png|webp)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
