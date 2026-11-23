import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NumSum Labs",
    short_name: "NumSum",
    description: "MSME innovation, IRIS inspection software and long-term investment research tools.",
    start_url: "/",
    display: "standalone",
    background_color: "#02050a",
    theme_color: "#02050a",
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
