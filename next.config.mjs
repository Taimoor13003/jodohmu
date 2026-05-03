/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc'
      }
    ],
  },
  async headers() {
    return [
      {
        source: "/dashboard",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
      {
        source: "/profiles",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
      {
        source: "/profile/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
      {
        source: "/login",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
      {
        source: "/register",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
      {
        source: "/:locale(en|id)/dashboard/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
      {
        source: "/:locale(en|id)/profiles/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
      {
        source: "/:locale(en|id)/profile/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
      {
        source: "/:locale(en|id)/login",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
      {
        source: "/:locale(en|id)/register",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
    ];
  },
};

export default nextConfig;
