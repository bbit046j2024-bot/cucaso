import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CUCASO - Coastal Universities & Colleges Adventist Students Organization",
    short_name: "CUCASO",
    description:
      "Official digital platform for Seventh-day Adventist universities, colleges, and schools across the Mombasa coastal region.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a192f",
    theme_color: "#1a3a8f",
    icons: [
      {
        src: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        src: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/logo-circular.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
