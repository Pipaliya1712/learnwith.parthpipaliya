import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "jyaukpeeblnbpktyopug.supabase.co",
      },
    ],
    // Supabase storage images are already served via Cloudflare CDN.
    // Disabling Next.js optimization avoids the NAT64 SSRF false-positive
    // where Cloudflare IPs (64:ff9b::/96 prefix) are flagged as "private".
    unoptimized: true,
  },
};

export default nextConfig;
