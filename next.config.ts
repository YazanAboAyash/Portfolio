import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { contentSecurityPolicy } from "./lib/csp";

const nextConfig: NextConfig = {
  // Allow cross-origin requests from local network devices during development
  allowedDevOrigins: process.env.ALLOWED_DEV_ORIGINS?.split(",") || [],

  // Performance optimizations
  poweredByHeader: false,

  // Prisma 7 compatibility - include Prisma client in output tracing
  outputFileTracingIncludes: {
    "/api/**/*": ["./node_modules/@prisma/client/**/*"],
    "/**": ["./node_modules/@prisma/client/**/*"],
  },

  // Image optimization with modern formats
  images: {
    // Optimize image quality based on device capabilities
    qualities: [75, 80, 85, 90, 100],
    // Enable modern image formats
    formats: ["image/avif", "image/webp"],
    // Add image optimization for better performance
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/u/**",
      },
    ],
  },

  // Experimental features for better performance
  experimental: {
    // WebAssembly support for Prisma 7 query compiler
    serverActions: {
      bodySizeLimit: "2mb",
    },
    optimizePackageImports: [
      "lucide-react",
      "react-icons",
      "framer-motion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-hover-card",
      "@radix-ui/react-tooltip",
    ],
  },

  // Webpack configuration for Prisma WASM modules
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.experiments = {
        ...config.experiments,
        asyncWebAssembly: true,
        layers: true,
      };
    }
    return config;
  },
  async headers() {
    return [
      {
        // Apply comprehensive security and performance headers
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          // Performance headers
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            // Fallback for routes the proxy skips; pages get a nonce-based
            // policy from proxy.ts instead.
            key: "Content-Security-Policy",
            value: contentSecurityPolicy(),
          },
        ],
      },
      // Static assets cache optimization. Production only: dev chunk URLs are
      // not content-hashed, so `immutable` pins stale modules in the browser.
      ...(process.env.NODE_ENV === "production"
        ? [
            {
              source:
                "/((?!api/).*).(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp|avif|mp4|webm)",
              headers: [
                {
                  key: "Cache-Control",
                  value: "public, max-age=31536000, immutable",
                },
              ],
            },
          ]
        : []),
      {
        // API routes cache and security
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=86400, stale-while-revalidate=43200",
          },
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, nosnippet, noarchive",
          },
        ],
      },
      {
        // Admin API routes
        source: "/api/admin/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, nosnippet, noarchive",
          },
        ],
      },
      {
        // Enhanced security for ChatBot API
        source: "/api/chatbot",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, nosnippet, noarchive",
          },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
