/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * argon2 is a native Node.js addon (N-API).
   * Bundling it with webpack breaks the native .node file on Vercel/Lambda.
   * Declaring it here tells Next.js to leave it as an external require().
   * This fixes "Invalid email or password" on production (argon2 silently
   * returning false because the bundled binary is wrong for the runtime OS).
   */
  serverExternalPackages: ["argon2"],
  experimental: {
    serverComponentsExternalPackages: ["argon2"],
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "drive.google.com" },
    ],
  },
};

module.exports = nextConfig;
