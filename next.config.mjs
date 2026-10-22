/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: new URL(".", import.meta.url).pathname,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "d8j0ntlcm91z4.cloudfront.net" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      {
        source: "/eventi",
        destination: "https://events.dbyoung.it",
        permanent: true,
      },
      {
        source: "/eventi/:path*",
        destination: "https://events.dbyoung.it/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            // CSP: solo le origini realmente usate (Turnstile, Convex festivo, Blob Vercel,
            // foto/video CloudFront del hero). Di default tutto 'self'.
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://images.unsplash.com https://d8j0ntlcm91z4.cloudfront.net",
              "media-src 'self' blob: https://d8j0ntlcm91z4.cloudfront.net",
              "font-src 'self' data:",
              "connect-src 'self' https://challenges.cloudflare.com https://festive-ptarmigan-321.convex.cloud wss://festive-ptarmigan-321.convex.cloud https://festive-ptarmigan-321.convex.site https://*.blob.vercel-storage.com",
              "frame-src https://challenges.cloudflare.com",
              "worker-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
