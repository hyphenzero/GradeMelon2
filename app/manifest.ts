import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Grade Melon",
    short_name: "Grade Melon",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#16a34a",
    icons: [
      {
        src: "/assets/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
