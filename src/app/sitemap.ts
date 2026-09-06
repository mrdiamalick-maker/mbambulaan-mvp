import type { MetadataRoute } from "next";
import { publicNews, publicAnnouncements } from "@/data/public-content";
import { publicTerritories } from "@/data/public-atlas";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mbambulaan.sn";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/decouvrir`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/atlas`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/opportunites`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/solutions`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/mbambulaan`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/mentions-legales`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${baseUrl}/confidentialite`, changeFrequency: "yearly", priority: 0.1 }
  ];

  const contentRoutes: MetadataRoute.Sitemap = publicNews.map((item) => ({
    url: `${baseUrl}/decouvrir/${item.id}`,
    changeFrequency: "monthly",
    priority: 0.7
  }));

  const territoryRoutes: MetadataRoute.Sitemap = publicTerritories.map((item) => ({
    url: `${baseUrl}/atlas/${item.slug}`,
    changeFrequency: "monthly",
    priority: 0.7
  }));

  const opportunityRoutes: MetadataRoute.Sitemap = publicAnnouncements.map((item) => ({
    url: `${baseUrl}/opportunites/${item.id}`,
    changeFrequency: "weekly",
    priority: 0.6
  }));

  return [...staticRoutes, ...contentRoutes, ...territoryRoutes, ...opportunityRoutes];
}
